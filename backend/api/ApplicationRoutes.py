from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from backend.database.db import db
from backend.auth.auth_handler import get_current_user
from uuid import UUID

from backend.services.MatchingService import MatchingService

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/apply/{job_id}")
async def apply_for_job(job_id: UUID, current_user: dict = Depends(get_current_user), db: Client = Depends(db.get_db)):
    user_id = current_user["id"]
    resume = db.table("resume").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).single().execute()
    if not resume.data:
        raise HTTPException(status_code=400, detail="Upload a resume before applying")
    resume_id = resume.data[0]["id"]

    job = db.table("job_posting").select("required_skills").eq("id", job_id).single().execute()
    if not job.data:
        raise HTTPException(status_code=404, detail="Job not found")

    user_skills = resume.data[0].get("skills", [])
    required_skills = job.data.get("required_skills", [])

    match_score = MatchingService.calculate_score(user_skills, required_skills)

    application_data = {
        "user_id": user_id,
        "job_id": job_id,
        "resume_id": resume_id,
        "status": "applied",
        "match_score": match_score #TODO maybe change the score calculating
    }                          #     algorithm or get a crewai agent

    res = db.table("job_matches").upsert(application_data, on_conflict="user_id, job_id").execute()
    return {"message": "Application submitted successfully", "data": res.data}

@router.get("/my-applications")
async def get_user_applications(current_user: dict = Depends(get_current_user), db: Client = Depends(db.get_db)):
    user_id = current_user["id"]
    res = db.table("job_matches") \
        .select("status, match_score, job_posting(job_title, company_name)") \
        .eq("user_id", user_id) \
        .execute()
    return res.data
