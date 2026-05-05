from fastapi import Request, HTTPException, Depends
from supabase import Client
from supabase_auth.errors import AuthApiError

from backend.database.db import db


def get_user_id(current_user) -> str:
    user_id = getattr(current_user, "id", None)
    if user_id is None and isinstance(current_user, dict):
        user_id = current_user.get("id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authenticated user")
    return str(user_id)


async def get_current_user(request: Request, db_client: Client = Depends(db.get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing / invalid token")

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing / invalid token")

    try:
        user_response = db_client.auth.get_user(token)
    except AuthApiError as exc:
        message = str(exc).lower()

        if "expired" in message:
            raise HTTPException(
                status_code=401,
                detail="Session expired. Please refresh your session or log in again.",
            ) from exc

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        ) from exc

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid session")

    return user_response.user


async def require_pro_tier(current_user=Depends(get_current_user), db_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    profile_record = db_client.table("user_profiles").select("tier").eq("id", user_id).single().execute()

    if not profile_record.data:
        raise HTTPException(status_code=403, detail="Access denied. Pro tier required.")

    user_tier = (profile_record.data.get("tier") or "free").lower()
    if user_tier != "pro":
        raise HTTPException(status_code=402, detail="Access denied. Pro tier required.")
    return current_user
