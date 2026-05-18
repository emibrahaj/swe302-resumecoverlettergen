from typing import List

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, require_pro_tier, get_user_id
from backend.database.db import db
from backend.schemas.JobSchema import JobPostingResponse
from backend.services.AIDataService import AIDataService
from backend.services.MatchingService import MatchingService

router = APIRouter(prefix="/jobs", tags=["User Discovery"])


def _get_user_resume(db_client: Client, resume_id: str, user_id: str) -> dict:
    res = (
        db_client.table("resumes")
        .select("id, user_id, raw_content, polished_content, target_job_title")
        .eq("id", str(resume_id))
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found for this user")
    return res.data


@router.get("/browse", response_model=List[JobPostingResponse])
async def browse_active_jobs(db_client: Client = Depends(db.get_db)):
    jobs = db_client.table("job_posting").select("*").eq("is_active", True).order("created_at", desc=True).execute()
    return jobs.data


@router.post("/match-my-resume/{resume_id}")
async def match_my_resume_to_jobs(
    resume_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Generate and save job_matches rows for one resume against all active jobs."""
    user_id = get_user_id(current_user)
    resume = _get_user_resume(db_client, resume_id, user_id)
    resume_content = resume.get("polished_content") or resume.get("raw_content") or {}
    user_skills = AIDataService.extract_skill_names(resume_content)

    jobs_res = db_client.table("job_posting").select("*").eq("is_active", True).execute()
    jobs = jobs_res.data or []

    saved_matches = []
    for job in jobs:
        try:
            required_skills = job.get("required_skills") or []
            match_score = MatchingService.calculate_score(user_skills, required_skills)

            # Check by (user_id, job_id) — consistent with the apply endpoint so we
            # never create duplicate rows for the same user+job pair.
            existing = (
                db_client.table("job_matches")
                .select("id, status, resume_id")
                .eq("user_id", user_id)
                .eq("job_id", str(job["id"]))
                .limit(1)
                .execute()
            )

            if existing.data:
                current_status = existing.data[0].get("status")
                update_payload: dict = {"match_score": match_score, "resume_id": str(resume_id)}
                # Never overwrite a real application status back to 'matched'.
                if current_status == "matched":
                    update_payload["status"] = "matched"
                res = db_client.table("job_matches").update(update_payload).eq("id", existing.data[0]["id"]).execute()
            else:
                payload = {
                    "user_id": user_id,
                    "job_id": str(job["id"]),
                    "resume_id": str(resume_id),
                    "cover_letter_id": None,
                    "match_score": match_score,
                    "status": "matched",
                }
                res = db_client.table("job_matches").insert(payload).execute()

            if res.data:
                saved = dict(res.data[0])
                saved["job_posting"] = job
                saved_matches.append(saved)
        except Exception:
            # Skip this job on error rather than aborting the entire request.
            continue

    saved_matches.sort(key=lambda item: item.get("match_score", 0), reverse=True)
    return {"resume_id": resume_id, "matches_saved": len(saved_matches), "matches": saved_matches}


@router.get("/recommendations")
async def get_recommendations(db_client: Client = Depends(db.get_db), current_user=Depends(require_pro_tier)):
    user_id = get_user_id(current_user)
    res = (
        db_client.table("job_matches")
        .select("match_score, status, resume_id, cover_letter_id, job_posting(*)")
        .eq("user_id", user_id)
        .gt("match_score", 0.7)
        .order("match_score", desc=True)
        .execute()
    )
    return res.data


@router.get("/my-applications")
async def get_user_applications(current_user=Depends(require_pro_tier), db_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    res = (
        db_client.table("job_matches")
        .select("status, match_score, created_at, resume_id, cover_letter_id, job_posting(job_title, company_name)")
        .eq("user_id", user_id)
        .in_("status", ["applied", "accepted", "declined", "invited"])
        .execute()
    )
    return res.data


@router.get("/{job_id}", response_model=JobPostingResponse)
async def get_job_detail(job_id: str, db_client: Client = Depends(db.get_db)):
    res = db_client.table("job_posting").select("*").eq("id", job_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return res.data