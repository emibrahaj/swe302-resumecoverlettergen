from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.AIFeatureSchema import CoverLetterGenerateRequest
from backend.schemas.CoverLetterSchema import CoverLetterCreate, CoverLetterUpdate
from backend.services.AIService import AIService

router = APIRouter(prefix="/cover-letters", tags=["Cover Letters"])


def _get_resume_context(db_client: Client, resume_id: UUID | str, user_id: str) -> dict:
    res = (
        db_client.table("resumes")
        .select("id, raw_content, polished_content, target_job_title")
        .eq("id", str(resume_id))
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found for this user")
    return res.data


@router.post("/", response_model=dict)
async def create_cover_letter(
    data: CoverLetterCreate,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    payload = data.model_dump(mode="json")
    payload["user_id"] = get_user_id(current_user)
    res = db_client.table("cover_letters").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save cover letter")
    return res.data[0]


@router.post("/generate", response_model=dict)
async def generate_cover_letter(
    data: CoverLetterGenerateRequest,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Generate an AI cover letter and immediately save it in cover_letters."""
    user_id = get_user_id(current_user)

    resume_context = None
    if data.resume_id:
        resume = _get_resume_context(db_client, data.resume_id, user_id)
        resume_context = resume.get("polished_content") or resume.get("raw_content") or {}

    try:
        generated_content = AIService.run_cover_letter_pipeline(
            user_data=data.user_input or "",
            job_position=data.job_position,
            resume_context=str(resume_context) if resume_context else None,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI cover letter generation failed: {exc}")

    payload = {
        "user_id": user_id,
        "resume_id": str(data.resume_id) if data.resume_id else None,
        "title": data.title or f"Cover Letter - {data.job_position}",
        "content": generated_content,
        "type": data.type or "ai_generated",
        "job_position": data.job_position,
    }

    res = db_client.table("cover_letters").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Generated cover letter was not saved")

    return {
        "status": "saved",
        "cover_letter": res.data[0],
    }


@router.get("/", response_model=List[dict])
async def get_my_cover_letters(current_user=Depends(get_current_user), db_client: Client = Depends(db.get_db)):
    res = (
        db_client.table("cover_letters")
        .select("*")
        .eq("user_id", get_user_id(current_user))
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.get("/{cover_letter_id}")
async def get_cover_letter(
    cover_letter_id: UUID,
    db_client: Client = Depends(db.get_db),
    current_user=Depends(get_current_user),
):
    res = (
        db_client.table("cover_letters")
        .select("*")
        .eq("id", str(cover_letter_id))
        .eq("user_id", get_user_id(current_user))
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Cover Letter not found")
    return res.data


@router.patch("/{cover_letter_id}")
async def update_cover_letter(
    cover_letter_id: UUID,
    updates: CoverLetterUpdate,
    db_client: Client = Depends(db.get_db),
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    existing = (
        db_client.table("cover_letters")
        .select("id, user_id")
        .eq("id", str(cover_letter_id))
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Cover letter ID does not exist")

    existing_user_id = str(existing.data[0].get("user_id"))

    if existing_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="This cover letter belongs to another user or was saved with a different user_id",
        )

    payload = updates.model_dump(mode="json", exclude_unset=True)

    if not payload:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    update_res = (
        db_client.table("cover_letters")
        .update(payload)
        .eq("id", str(cover_letter_id))
        .eq("user_id", user_id)
        .execute()
    )

    refreshed = (
        db_client.table("cover_letters")
        .select("*")
        .eq("id", str(cover_letter_id))
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not refreshed.data:
        raise HTTPException(status_code=500, detail="Cover letter updated but could not be reloaded")

    return refreshed.data

@router.delete("/{cover_letter_id}")
async def delete_cover_letter(
    cover_letter_id: UUID,
    db_client: Client = Depends(db.get_db),
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)
    existing = (
        db_client.table("cover_letters")
        .select("id, user_id")
        .eq("id", str(cover_letter_id))
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    if str(existing.data[0].get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Not authorised to delete this cover letter")
    db_client.table("cover_letters").delete().eq("id", str(cover_letter_id)).execute()
    return {"status": "success", "message": "Cover Letter deleted successfully"}