"""
SQLite engine for the local persistence shim.

One shared sqlite3.Connection (multi-thread-safe through a single global RLock).
On first import, ensures the schema is in place and seeds reference data.
"""
from __future__ import annotations

import json
import os
import sqlite3
import threading
import uuid
from pathlib import Path
from typing import Any, Iterable

from .local_schema import ADDITIVE_COLUMN_MIGRATIONS, BOOL_COLUMNS, DDL_STATEMENTS, JSON_COLUMNS, SEED_DATA

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = PROJECT_ROOT / "data" / "app.db"


def _resolve_db_path() -> Path:
    raw = os.environ.get("LOCAL_DB_PATH")
    if raw:
        p = Path(raw)
        return p if p.is_absolute() else (PROJECT_ROOT / p)
    return DEFAULT_DB_PATH


_write_lock = threading.RLock()
_conn: sqlite3.Connection | None = None
_schema_ready = False


def _create_connection(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(
        str(db_path),
        check_same_thread=False,
        isolation_level=None,   # autocommit; we wrap multi-statement writes in explicit BEGIN
        detect_types=0,
    )
    conn.row_factory = sqlite3.Row
    # Register UUID generators so DEFAULT clauses or hand-rolled INSERTs work.
    conn.create_function("gen_random_uuid", 0, lambda: str(uuid.uuid4()))
    conn.create_function("uuid_generate_v4", 0, lambda: str(uuid.uuid4()))
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    return conn


def get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        with _write_lock:
            if _conn is None:
                _conn = _create_connection(_resolve_db_path())
                _ensure_schema(_conn)
    return _conn


def _ensure_schema(conn: sqlite3.Connection) -> None:
    global _schema_ready
    if _schema_ready:
        return
    with _write_lock:
        for stmt in DDL_STATEMENTS:
            conn.execute(stmt)
        # Additive migrations for existing databases that pre-date a column.
        for table, column, col_type in ADDITIVE_COLUMN_MIGRATIONS:
            try:
                conn.execute(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {col_type}')
            except sqlite3.OperationalError as exc:
                if "duplicate column" not in str(exc).lower():
                    raise
        for table_name, rows in SEED_DATA:
            cur = conn.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cur.fetchone()[0]
            if count == 0:
                for row in rows:
                    full_row = {"id": str(uuid.uuid4()), **row}
                    encoded = encode_row(table_name, full_row)
                    cols = ", ".join(encoded.keys())
                    placeholders = ", ".join("?" for _ in encoded)
                    conn.execute(
                        f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})",
                        tuple(encoded.values()),
                    )
        _schema_ready = True


# ---------- JSON / bool round-tripping ----------

def encode_row(table: str, row: dict[str, Any]) -> dict[str, Any]:
    """Prepare a dict for INSERT/UPDATE: serialize JSON columns, coerce bools to int."""
    json_cols = JSON_COLUMNS.get(table, set())
    bool_cols = BOOL_COLUMNS.get(table, set())
    out: dict[str, Any] = {}
    for k, v in row.items():
        if v is None:
            out[k] = None
        elif k in json_cols:
            if isinstance(v, (dict, list)):
                out[k] = json.dumps(v)
            elif isinstance(v, str):
                out[k] = v  # caller may have pre-serialized
            else:
                out[k] = json.dumps(v)
        elif k in bool_cols:
            out[k] = 1 if v else 0
        elif isinstance(v, bool):
            out[k] = 1 if v else 0
        elif isinstance(v, (dict, list)):
            # Defensive: column not in JSON_COLUMNS but caller passed a dict.
            # Serialize so SQLite accepts it; downstream code receives a string.
            out[k] = json.dumps(v)
        else:
            out[k] = v
    return out


def decode_row(table: str, row: sqlite3.Row | dict[str, Any] | None) -> dict[str, Any] | None:
    """Inverse of encode_row: parse JSON columns, coerce 0/1 ints back to bool for known bool columns."""
    if row is None:
        return None
    src = dict(row) if not isinstance(row, dict) else row
    json_cols = JSON_COLUMNS.get(table, set())
    bool_cols = BOOL_COLUMNS.get(table, set())
    out: dict[str, Any] = {}
    for k, v in src.items():
        if v is None:
            out[k] = None
        elif k in json_cols and isinstance(v, str):
            try:
                out[k] = json.loads(v)
            except (ValueError, TypeError):
                out[k] = v
        elif k in bool_cols:
            out[k] = bool(v)
        else:
            out[k] = v
    return out


def decode_rows(table: str, rows: Iterable[sqlite3.Row]) -> list[dict[str, Any]]:
    return [decode_row(table, r) for r in rows]


def write_lock() -> threading.RLock:
    return _write_lock
