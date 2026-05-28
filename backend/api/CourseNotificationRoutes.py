"""
Course "Coming Soon" notification sign-ups.

Public endpoint (no auth) so any visitor on the Courses page can leave their
email to be notified when new courses launch. Stored in the
`course_notifications` table (see migrations/008_course_notifications.sql) which
doubles as the mailing list for future course/newsletter campaigns.

Behaviour:
  - validates the email (pydantic EmailStr + normalisation)
  - de-duplicates: an already-subscribed email returns success, never an error
  - degrades cleanly if the table hasn't been migrated yet (clear 503 instead of
    a 500 stack trace) so the UI can show a friendly message
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import Client

from backend.database.db import db

router = APIRouter(prefix="/course-notifications", tags=["course-notifications"])


class CourseNotificationRequest(BaseModel):
    email: EmailStr


def _table_missing(message: str) -> bool:
    m = message.lower()
    return (
        "pgrst205" in m
        or "could not find the table" in m
        or "does not exist" in m
        or "42p01" in m
    )


def _is_duplicate(message: str) -> bool:
    m = message.lower()
    return "duplicate" in m or "unique" in m or "23505" in m


@router.post("/subscribe")
async def subscribe(
    payload: CourseNotificationRequest,
    db_client: Client = Depends(db.get_db),
):
    email = str(payload.email).strip().lower()

    # De-dupe first so re-submitting the same email is a friendly success.
    try:
        existing = (
            db_client.table("course_notifications")
            .select("id")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        if existing.data:
            return {"status": "already_subscribed", "message": "You're already on the list."}
    except Exception as exc:
        # Only the missing-table case is expected here; anything else we log and
        # still attempt the insert below (which will surface the real error).
        if not _table_missing(str(exc)):
            print(f"[CourseNotifications] dedupe lookup failed: {exc!r}")

    try:
        db_client.table("course_notifications").insert(
            {"id": str(uuid.uuid4()), "email": email}
        ).execute()
    except Exception as exc:
        message = str(exc)
        if _is_duplicate(message):
            return {"status": "already_subscribed", "message": "You're already on the list."}
        if _table_missing(message):
            print(
                "[CourseNotifications] course_notifications table missing — run "
                "backend/database/migrations/008_course_notifications.sql"
            )
            raise HTTPException(
                status_code=503,
                detail="Notifications aren't set up on the server yet. Please try again later.",
            ) from exc
        print(f"[CourseNotifications] subscribe insert failed: {exc!r}")
        raise HTTPException(
            status_code=500,
            detail="Could not save your request. Please try again.",
        ) from exc

    return {
        "status": "subscribed",
        "message": "You're on the list! We'll notify you about new courses.",
    }
