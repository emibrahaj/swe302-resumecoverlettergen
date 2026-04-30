from typing import List

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, require_pro_tier
from backend.database.db import db
from backend.schemas.JobSchema import JobPostingCreate, JobPostingResponse

router = APIRouter(prefix="/jobs", tags=["User Discovery"])
#TODO decide whether any of these is available on the free tier
@router.post("/browse", response_model=List[JobPostingResponse])
async def browse_active_jobs(db_client: Client = Depends(db.get_db)):
    jobs = db_client.table("job_posting").select("*").eq("is_active", True).order("created_at", desc=True).execute()
    return jobs.data

@router.get("/recommendations")
async def get_recommendations(db_client: Client = Depends(db.get_db), current_user = Depends(require_pro_tier)):
    res = db_client.table("job_matches").select("match_score, job_posting(*)").eq("user_id", current_user["id"]).gt("match_score", 0.7).order("match_score", desc=True).execute()
    return res.data

@router.get("/my-applications")
async def get_user_applications(current_user = Depends(require_pro_tier()), db_client: Client = Depends(db.get_db)):
    res = db_client.table("job_matches") \
        .select("status, match_score, created_at, job_posting(job_title, company_name)") \
        .eq("user_id", current_user.id) \
        .execute()
    return res.data

@router.get("/{job_id}", response_model=JobPostingResponse)
async def get_job_detail(job_id: str, db_client: Client = Depends(db.get_db)):
    res = db_client.table("job_posting").select("*").eq("id", job_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return res.data