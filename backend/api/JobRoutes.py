from typing import List

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from backend.database.db import db
from backend.schemas.JobSchema import JobPostingCreate, JobPostingResponse
from backend.auth.auth_handler import get_current_user

router = APIRouter(prefix="/job", tags=["jobs"])

@router.post("/", response_model=JobPostingResponse)
async def create_job(data: JobPostingCreate, db_client: Client = Depends(db.get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id
    company = db_client.table("companies").select("is_verified, company_name").eq("id", user_id).single().execute()

    if not company.data:
        raise HTTPException(status_code=404, detail="Company not found")

    if not company.data.get("is_verified"):
        raise HTTPException(status_code=403, detail="Company not verified")

    job_dict = data.model_dump()
    job_dict["company_id"] = user_id
    job_dict["company_name"] = company.data["company_name"]

    job_response = db_client.table("job_posting").insert(job_dict).execute()
    return job_response.data[0]

@router.get("/all", response_model=List[JobPostingResponse])
async def get_all_jobs(db_client: Client = Depends(db.get_db)):
    jobs = db_client.table("job_posting").select("*").eq("is_active", True).execute()
    return jobs.data

@router.get("/company/{company_id}", response_model=List[JobPostingResponse])
async def get_company_jobs(company_id: str, db: Client = Depends(db.get_db)):
    res = db.table("job_posting").select("*").eq("company_id", company_id).execute()
    return res.data

@router.get("/my-jobs", response_model=List[JobPostingResponse])
async def get_my_jobs(user_id: str, db_client: Client = Depends(db.get_db)):
    res = db_client.table("job_posting").select("*").eq("company_id", user_id).execute()
    return res.data

@router.get("/{job_id}")
async def update_job(job_id: str, updates: dict, db_client: Client = Depends(db.get_db), current_user = Depends(get_current_user)):
    job = db_client.table("job_posting").select("company_id").eq("id", job_id).single().execute()
    if not job.data or str(job.data["company_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized")
    res = db_client.table("job_posting").update(updates).eq("id", job_id).execute()
    return res.data[0]

@router.delete("/{job_id}")
async def delete_job(job_id: str, db_client: Client = Depends(db.get_db), current_user = Depends(get_current_user)):
    job = db_client.table("job_posting").select("company_id").eq("id", job_id).single().execute()
    if not job.data or str(job.data["company_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized")
    db_client.table("job_posting").delete().eq("id", job_id).execute()
    return {"status": "deleted"}