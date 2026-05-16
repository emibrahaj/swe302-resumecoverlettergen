from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db

router = APIRouter(prefix="/user", tags=["user"])


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None


def _safe_get(db_client, table: str, match_col: str, match_val: str):
    try:
        res = (
            db_client.table(table)
            .select("*")
            .eq(match_col, match_val)
            .limit(1)
            .execute()
        )
        rows = res.data or []
        return rows[0] if rows else None
    except Exception:
        return None


@router.get("/profile")
def get_user_profile(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)

    profile = _safe_get(db_client, "user_profiles", "id", user_id)

    if profile is None:
        try:
            db_client.table("user_profiles").insert({"id": user_id}).execute()
        except Exception:
            pass
        profile = {"id": user_id, "full_name": None, "avatar_url": None, "tier": "free", "location": None}

    # Email comes from the auth user object (auth.users)
    email = getattr(current_user, "email", None)

    return {**profile, "email": email}


@router.put("/profile")
def update_user_profile(
    data: UserProfileUpdate,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)

    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    try:
        db_client.table("user_profiles").upsert({"id": user_id, **payload}).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {e}") from e

    profile = _safe_get(db_client, "user_profiles", "id", user_id) or {}
    email = getattr(current_user, "email", None)

    return {**profile, "email": email}