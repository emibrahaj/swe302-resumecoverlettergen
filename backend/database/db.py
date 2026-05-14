"""
Backend database factory.

By default (USE_LOCAL_DB unset or truthy) we construct a LocalClient — a drop-in
shim that mimics supabase-py's surface but persists to a local SQLite file,
issues its own JWTs, and stores files in `data/storage/`.

To swap back to a real Supabase project: set USE_LOCAL_DB=false in backend/.env
and ensure NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
"""
from __future__ import annotations

import os
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(_env_path if os.path.exists(_env_path) else None)


def _use_local() -> bool:
    raw = (os.environ.get("USE_LOCAL_DB") or "true").strip().lower()
    return raw in {"1", "true", "yes", "on"}


class Database:
    def __init__(self):
        self.bucket_name = "resumes-pdfs"
        if _use_local():
            from backend.database.local_client import LocalClient
            self.client = LocalClient()
            self.mode = "local"
        else:
            from supabase import create_client
            url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            if not url or not key:
                raise ValueError(
                    "USE_LOCAL_DB is false but Supabase URL / service-role key are missing."
                )
            self.client = create_client(url, key)
            self.mode = "supabase"

    def get_db(self):
        return self.client

    def storage_bucket(self):
        return self.client.storage.from_(self.bucket_name)


db = Database()
db_client = db.get_db()
