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
        # AuthService.sign_in_with_password / sign_up mutate the singleton's
        # PostgREST Authorization header to the user's JWT, which makes
        # subsequent DB writes subject to RLS as that user. Reset to the
        # service-role key on every retrieval so backend writes bypass RLS.
        try:
            db_client.postgrest.auth(_key)
        except Exception:
            # Older supabase-py versions or partial init — fail open;
            # the request will still try and surface its own RLS error.
            pass
        return db_client


db = _DB()
