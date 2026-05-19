import os
from dotenv import load_dotenv
from supabase import create_client, Client

_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(_env_path if os.path.exists(_env_path) else None)

_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not _url or not _key:
    raise ValueError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

db_client: Client = create_client(_url, _key)


class _DB:
    """Thin wrapper kept for backward-compatibility with `db.get_db()` call sites."""
    def get_db(self) -> Client:
        return db_client


db = _DB()
