import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env vars from the repo-root .env (where .env.example lives). Falls back to
# backend/.env, then find_dotenv(), so it works regardless of launch directory.
# On Fly there is no .env file — secrets are injected as real env vars, so this is
# a harmless no-op there.
_backend_dir = os.path.dirname(os.path.dirname(__file__))
_root_env = os.path.join(os.path.dirname(_backend_dir), ".env")
_backend_env = os.path.join(_backend_dir, ".env")
if os.path.exists(_root_env):
    load_dotenv(_root_env)
elif os.path.exists(_backend_env):
    load_dotenv(_backend_env)
else:
    load_dotenv()

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
