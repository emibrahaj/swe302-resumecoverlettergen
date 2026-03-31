import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


def _get_supabase_client() -> Client:
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
    )

    if not url:
        raise RuntimeError(
            "Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in your environment."
        )

    if not key:
        raise RuntimeError(
            "Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY for backend use, "
            "or provide NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY."
        )

    return create_client(url, key)


supabase: Client | None = None


def get_db() -> Client:
    global supabase
    if supabase is None:
        supabase = _get_supabase_client()
    return supabase