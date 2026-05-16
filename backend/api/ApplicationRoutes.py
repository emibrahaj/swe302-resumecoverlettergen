from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.JobSchema import JobApplicationCreate
from backend.services.MatchingService import MatchingService

router = APIRouter(prefix="/applications", tags=["Applications"])


def _extract_skill_names(raw_content: dict) -> list[str]:
    skills = raw_content.get("skills", []) if isinstance(raw_content, dict) else []
    names = []
    for skill in skills:
        if isinstance(skill, dict):
            names.append(skill.get("skill_name") or skill.get("name") or "")
        else:
            names.append(str(skill))
    return [s for s in names if s]


@router.post("/apply/{job_id}")
async def apply_for_job(job_id: UUID, data: JobApplicationCreate | None = None, current_user=Depends(get_current_user),
                        db_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    payload = data or JobApplicationCreate()

    resume_query = db_client.table("resumes").select("*").eq("user_id", user_id)
    if payload.resume_id:
        resume_query = resume_query.eq("id", str(payload.resume_id))
    else:
        resume_query = resume_query.order("created_at", desc=True).limit(1)
    resume_res = resume_query.execute()

    if not resume_res.data:
        raise HTTPException(status_code=400, detail="Create or upload a resume before applying")
    resume = resume_res.data[0]
    resume_id = resume["id"]

    job = db_client.table("job_posting").select("required_skills").eq("id", str(job_id)).single().execute()
    if not job.data:
        raise HTTPException(status_code=404, detail="Job not found")

    user_skills = _extract_skill_names(resume.get("polished_content") or resume.get("raw_content") or {})
    required_skills = job.data.get("required_skills") or []
    match_score = MatchingService.calculate_score(user_skills, required_skills)

    existing = db_client.table("job_matches").select("id").eq("user_id", user_id).eq("job_id", str(job_id)).limit(
        1).execute()
    application_data = {"user_id": user_id, "job_id": str(job_id), "resume_id": resume_id,
        "cover_letter_id": str(payload.cover_letter_id) if payload.cover_letter_id else None, "status": "applied",
        "match_score": match_score, }

    if existing.data:
        res = db_client.table("job_matches").update(application_data).eq("id", existing.data[0]["id"]).execute()
    else:
        res = db_client.table("job_matches").insert(application_data).execute()
    return {"message": "Application submitted successfully", "data": res.data}


@router.get("/my-applications")
async def get_user_applications(current_user=Depends(get_current_user), db_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    res = (
        db_client.table("job_matches")
        .select("id, job_id, status, match_score, created_at, resume_id, cover_letter_id, job_posting(job_title, company_name, job_location, salary)")
        .eq("user_id", user_id)
        .in_("status", ["applied", "accepted", "declined", "invited"])
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.delete("/{match_id}")
async def cancel_application(match_id: UUID, current_user=Depends(get_current_user), db_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    existing = (
        db_client.table("job_matches")
        .select("id, status")
        .eq("id", str(match_id))
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Application not found")
    if existing.data["status"] != "applied":
        raise HTTPException(status_code=400, detail="Only pending applications can be withdrawn")
    db_client.table("job_matches").update({"status": "matched"}).eq("id", str(match_id)).execute()
    return {"message": "Application withdrawn"}