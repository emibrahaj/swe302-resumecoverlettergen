"""
LocalClient — drop-in replacement for `supabase.Client`.

Exposes the three sub-objects the codebase uses (`.table()`, `.auth`, `.storage`)
so existing routes/services don't need to change. Backed by:
    - SQLite (local_engine.py + local_query.py)
    - PyJWT + bcrypt (local_auth.py)
    - filesystem (local_storage.py)

Construction is cheap; the first .table() / .auth call lazily initializes the
SQLite schema via local_engine.get_conn().
"""
from __future__ import annotations

from .local_auth import LocalAuth
from .local_engine import get_conn
from .local_query import Table
from .local_storage import LocalStorage


class LocalClient:
    def __init__(self) -> None:
        # Triggers schema init + seed on first construction.
        get_conn()
        self.auth = LocalAuth()
        self.storage = LocalStorage()

    def table(self, name: str) -> Table:
        return Table(name)
