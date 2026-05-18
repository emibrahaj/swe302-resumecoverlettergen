"""
Job Alerts Routes

Required Supabase table (run once in the Supabase SQL editor):

  CREATE TABLE IF NOT EXISTS job_alert_preferences (
    user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_enabled   BOOLEAN      NOT NULL DEFAULT TRUE,
    min_match_score FLOAT     NOT NULL DEFAULT 0.8,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db

router = APIRouter(prefix="/job-alerts", tags=["Job Alerts"])

_TABLE = "job_alert_preferences"
_DEFAULT_MIN_SCORE = 0.8


def _get_prefs(db_client: Client, user_id: str) -> dict | None:
    try:
        res = db_client.table(_TABLE).select("*").eq("user_id", user_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception:
        return None


@router.get("/status")
async def get_alert_status(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    pref = _get_prefs(db_client, user_id)
    if not pref:
        return {"is_enabled": False, "min_match_score": _DEFAULT_MIN_SCORE}
    return {
        "is_enabled": pref.get("is_enabled", False),
        "min_match_score": pref.get("min_match_score", _DEFAULT_MIN_SCORE),
    }


class AlertToggle(BaseModel):
    is_enabled: bool


@router.post("/toggle")
async def toggle_alerts(
    body: AlertToggle,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    try:
        db_client.table(_TABLE).upsert(
            {"user_id": user_id, "is_enabled": body.is_enabled}
        ).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to update alert preference") from exc
    return {"is_enabled": body.is_enabled}


@router.get("/notifications")
async def get_notifications(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    pref = _get_prefs(db_client, user_id)

    if not pref or not pref.get("is_enabled"):
        return {"notifications": [], "unread_count": 0}

    min_score = pref.get("min_match_score", _DEFAULT_MIN_SCORE)
    last_checked = pref.get("last_checked_at")

    # All high-match jobs for this user
    all_res = (
        db_client.table("job_matches")
        .select("id, match_score, created_at, job_posting(id, job_title, company_name, job_location, employment_type)")
        .eq("user_id", user_id)
        .gte("match_score", min_score)
        .order("match_score", desc=True)
        .limit(20)
        .execute()
    )
    notifications = all_res.data or []

    # Count entries newer than last_checked_at as unread
    unread_count = 0
    if last_checked:
        unread_count = sum(
            1 for n in notifications
            if n.get("created_at", "") > last_checked
        )
    else:
        unread_count = len(notifications)

    return {"notifications": notifications, "unread_count": unread_count}


@router.post("/mark-read")
async def mark_notifications_read(
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    now = datetime.now(timezone.utc).isoformat()
    try:
        db_client.table(_TABLE).upsert(
            {"user_id": user_id, "last_checked_at": now}
        ).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to mark notifications read") from exc
    return {"success": True, "last_checked_at": now}
