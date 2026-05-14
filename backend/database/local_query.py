"""
PostgREST-style fluent query builder over SQLite.

Mimics the supabase-py `Client.table(...)` chain:
    db.table("resumes").select("*").eq("user_id", uid).order("created_at", desc=True).execute()
    db.table("resumes").insert({...}).execute()
    db.table("resumes").update({...}).eq("id", rid).execute()
    db.table("resumes").upsert({...}, on_conflict="id").execute()
    db.table("resumes").delete().eq("id", rid).execute()

execute() returns a `Result` with `.data` and `.error`.
- For .single() queries: `.data` is `dict | None`.
- For other selects: `.data` is `list[dict]`.
- For insert/update/upsert: `.data` is `list[dict]` of affected rows.
- For delete: `.data` is the list of deleted rows.
"""
from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from typing import Any, Iterable

from .local_engine import decode_rows, encode_row, get_conn, write_lock


# ---------- Result wrapper ----------

@dataclass
class Result:
    data: Any
    count: int | None = None
    error: Any | None = None


# ---------- Tiny ID-default policy ----------

def _ensure_id(table: str, row: dict[str, Any]) -> dict[str, Any]:
    if "id" not in row or row["id"] is None:
        row = {"id": str(uuid.uuid4()), **row}
    if table == "resumes" and ("temp_token" not in row or row["temp_token"] is None):
        row["temp_token"] = str(uuid.uuid4())
    return row


# ---------- Builders ----------

class Table:
    """Returned by client.table(name). Spawns operation-specific builders."""

    def __init__(self, name: str):
        self.name = name

    def select(self, cols: str = "*") -> "SelectQuery":
        return SelectQuery(self.name, cols)

    def insert(self, payload: dict[str, Any] | list[dict[str, Any]]) -> "InsertQuery":
        return InsertQuery(self.name, payload)

    def update(self, payload: dict[str, Any]) -> "UpdateQuery":
        return UpdateQuery(self.name, payload)

    def upsert(
        self,
        payload: dict[str, Any] | list[dict[str, Any]],
        on_conflict: str = "id",
    ) -> "UpsertQuery":
        return UpsertQuery(self.name, payload, on_conflict)

    def delete(self) -> "DeleteQuery":
        return DeleteQuery(self.name)


# ---------- Shared filter mixin ----------

class _FilterBase:
    """Common state for queries that can filter rows."""

    def __init__(self, table: str):
        self.table = table
        self._filters: list[tuple[str, str, Any]] = []   # (column, op, value)
        self._order: list[tuple[str, bool]] = []
        self._limit_val: int | None = None
        self._single = False
        self._maybe_single = False

    def eq(self, col: str, val: Any):
        self._filters.append((col, "=", val))
        return self

    def neq(self, col: str, val: Any):
        self._filters.append((col, "!=", val))
        return self

    def gte(self, col: str, val: Any):
        self._filters.append((col, ">=", val))
        return self

    def gt(self, col: str, val: Any):
        self._filters.append((col, ">", val))
        return self

    def lte(self, col: str, val: Any):
        self._filters.append((col, "<=", val))
        return self

    def lt(self, col: str, val: Any):
        self._filters.append((col, "<", val))
        return self

    def in_(self, col: str, values: Iterable[Any]):
        self._filters.append((col, "IN", list(values)))
        return self

    def order(self, col: str, desc: bool = False):
        self._order.append((col, desc))
        return self

    def limit(self, n: int):
        self._limit_val = int(n)
        return self

    def single(self):
        self._single = True
        self._maybe_single = False
        return self

    def maybe_single(self):
        """Like .single() but returns data=None instead of erroring on zero rows."""
        self._single = True
        self._maybe_single = True
        return self

    def _where_clause(self) -> tuple[str, list[Any]]:
        if not self._filters:
            return "", []
        clauses: list[str] = []
        params: list[Any] = []
        for col, op, val in self._filters:
            if op == "IN":
                vals = list(val) if val is not None else []
                if not vals:
                    clauses.append("1 = 0")
                else:
                    placeholders = ", ".join("?" for _ in vals)
                    clauses.append(f'"{col}" IN ({placeholders})')
                    params.extend(vals)
            else:
                clauses.append(f'"{col}" {op} ?')
                params.append(val)
        return "WHERE " + " AND ".join(clauses), params

    def _order_clause(self) -> str:
        if not self._order:
            return ""
        parts = [f'"{c}" {"DESC" if d else "ASC"}' for c, d in self._order]
        return "ORDER BY " + ", ".join(parts)


# ---------- SELECT ----------

_COLS_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


class SelectQuery(_FilterBase):
    def __init__(self, table: str, cols: str):
        super().__init__(table)
        self.cols = cols.strip() or "*"

    def _columns_sql(self) -> str:
        if self.cols == "*":
            return "*"
        # Accept "col1, col2" or "col1,col2"
        parts = [p.strip() for p in self.cols.split(",") if p.strip()]
        # Strip any nested-resource hints supabase syntax allows (e.g. "id(col)") — keep only simple names
        cleaned: list[str] = []
        for p in parts:
            m = _COLS_RE.match(p)
            if m:
                cleaned.append(f'"{m.group(0)}"')
        return ", ".join(cleaned) if cleaned else "*"

    def execute(self) -> Result:
        where, params = self._where_clause()
        order = self._order_clause()
        limit = f"LIMIT {int(self._limit_val)}" if self._limit_val is not None else ""
        sql = f'SELECT {self._columns_sql()} FROM "{self.table}" {where} {order} {limit}'.strip()
        cur = get_conn().execute(sql, params)
        rows = cur.fetchall()
        decoded = decode_rows(self.table, rows)
        if self._single:
            if len(decoded) == 0:
                # .maybe_single() tolerates zero rows; .single() raises in supabase-py
                # but our callers test `if not res.data` so returning None is safe.
                return Result(data=None)
            if len(decoded) > 1:
                return Result(data=None, error=f"Single requested but {len(decoded)} rows matched")
            return Result(data=decoded[0])
        return Result(data=decoded, count=len(decoded))


# ---------- INSERT ----------

class InsertQuery:
    def __init__(self, table: str, payload: dict[str, Any] | list[dict[str, Any]]):
        self.table = table
        self.payload = payload

    def execute(self) -> Result:
        rows = self.payload if isinstance(self.payload, list) else [self.payload]
        inserted: list[dict[str, Any]] = []
        with write_lock():
            conn = get_conn()
            for row in rows:
                row = _ensure_id(self.table, row)
                encoded = encode_row(self.table, row)
                cols = ", ".join(f'"{k}"' for k in encoded.keys())
                placeholders = ", ".join("?" for _ in encoded)
                conn.execute(
                    f'INSERT INTO "{self.table}" ({cols}) VALUES ({placeholders})',
                    tuple(encoded.values()),
                )
                cur = conn.execute(
                    f'SELECT * FROM "{self.table}" WHERE id = ?', (encoded["id"],)
                )
                fetched = cur.fetchone()
                decoded = decode_rows(self.table, [fetched]) if fetched else []
                if decoded:
                    inserted.append(decoded[0])
        return Result(data=inserted, count=len(inserted))


# ---------- UPDATE ----------

class UpdateQuery(_FilterBase):
    def __init__(self, table: str, payload: dict[str, Any]):
        super().__init__(table)
        self.payload = payload

    def execute(self) -> Result:
        if not self.payload:
            return Result(data=[])
        encoded = encode_row(self.table, self.payload)
        set_sql = ", ".join(f'"{k}" = ?' for k in encoded.keys())
        params: list[Any] = list(encoded.values())
        where, where_params = self._where_clause()
        params.extend(where_params)
        sql = f'UPDATE "{self.table}" SET {set_sql} {where}'.strip()
        with write_lock():
            conn = get_conn()
            conn.execute(sql, params)
            # Re-read affected rows to return them
            sel_where, sel_params = self._where_clause()
            cur = conn.execute(f'SELECT * FROM "{self.table}" {sel_where}', sel_params)
            rows = cur.fetchall()
        return Result(data=decode_rows(self.table, rows), count=len(rows))


# ---------- UPSERT ----------

class UpsertQuery:
    def __init__(
        self,
        table: str,
        payload: dict[str, Any] | list[dict[str, Any]],
        on_conflict: str,
    ):
        self.table = table
        self.payload = payload
        self.on_conflict = on_conflict

    def execute(self) -> Result:
        rows = self.payload if isinstance(self.payload, list) else [self.payload]
        affected: list[dict[str, Any]] = []
        with write_lock():
            conn = get_conn()
            for row in rows:
                # For upsert by id, allow caller to omit id only when it's not the conflict key.
                if self.on_conflict == "id":
                    row = _ensure_id(self.table, row)
                encoded = encode_row(self.table, row)
                cols = list(encoded.keys())
                cols_sql = ", ".join(f'"{c}"' for c in cols)
                placeholders = ", ".join("?" for _ in cols)
                update_assignments = ", ".join(
                    f'"{c}" = excluded."{c}"' for c in cols if c != self.on_conflict
                )
                if not update_assignments:
                    update_assignments = f'"{self.on_conflict}" = excluded."{self.on_conflict}"'
                sql = (
                    f'INSERT INTO "{self.table}" ({cols_sql}) VALUES ({placeholders}) '
                    f'ON CONFLICT("{self.on_conflict}") DO UPDATE SET {update_assignments}'
                )
                conn.execute(sql, tuple(encoded.values()))
                # Fetch the row by conflict key so we return canonical row
                key_val = encoded.get(self.on_conflict)
                if key_val is not None:
                    cur = conn.execute(
                        f'SELECT * FROM "{self.table}" WHERE "{self.on_conflict}" = ?',
                        (key_val,),
                    )
                    fetched = cur.fetchone()
                    if fetched:
                        decoded = decode_rows(self.table, [fetched])
                        affected.append(decoded[0])
        return Result(data=affected, count=len(affected))


# ---------- DELETE ----------

class DeleteQuery(_FilterBase):
    def execute(self) -> Result:
        with write_lock():
            conn = get_conn()
            where, params = self._where_clause()
            cur = conn.execute(f'SELECT * FROM "{self.table}" {where}', params)
            doomed = cur.fetchall()
            decoded = decode_rows(self.table, doomed)
            if decoded:
                conn.execute(f'DELETE FROM "{self.table}" {where}', params)
        return Result(data=decoded, count=len(decoded))
