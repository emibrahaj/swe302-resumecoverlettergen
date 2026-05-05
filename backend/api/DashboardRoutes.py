from fastapi import APIRouter, Depends, HTTPException
from backend.database.db import db_client
from backend.auth.auth_handler import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/me")
def get_my_dashboard(current_user=Depends(get_current_user)):
    supabase = db_client
    user_id = current_user.id

    profile = (
        supabase.table("user_profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    resumes = (
        supabase.table("resumes")
        .select("id, target_job_title, created_at, template_id")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    cover_letters = (
        supabase.table("cover_letters")
        .select("id, title, job_position, created_at, resume_id")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    feedback = (
        supabase.table("resume_feedback")
        .select("id, resume_id, overall_score, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    subscription = (
        supabase.table("subscriptions")
        .select("plan, status, end_date")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    subscription_data = (
        subscription.data
        if subscription is not None and subscription.data is not None
        else {
            "plan": "free",
            "status": "inactive",
            "end_date": None,
        }
    )

    return {
        "profile": profile.data,
        "resumes": resumes.data or [],
        "cover_letters": cover_letters.data or [],
        "recent_feedback": feedback.data or [],
        "subscription": subscription_data,
        "stats": {
            "resume_count": len(resumes.data or []),
            "cover_letter_count": len(cover_letters.data or []),
            "recent_feedback_count": len(feedback.data or []),
        },
    }