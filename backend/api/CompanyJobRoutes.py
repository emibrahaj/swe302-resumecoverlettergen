from typing import List

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.JobSchema import JobPostingCreate, JobPostingResponse, JobPostingUpdate
from backend.services.CompanyJobService import CompanyJobService

router = APIRouter(prefix="/company/jobs", tags=["Company Jobs"])


def _service(db_client: Client) -> CompanyJobService:
    return CompanyJobService(db_client)


def _enrich_matches(db_client: Client, matches: list[dict]) -> list[dict]:
    if not matches:
        return []

    user_ids = list({str(m["user_id"]) for m in matches if m.get("user_id")})
    resume_ids = list({str(m["resume_id"]) for m in matches if m.get("resume_id")})
    cover_letter_ids = list({str(m["cover_letter_id"]) for m in matches if m.get("cover_letter_id")})

    profiles = {}
    if user_ids:
        profile_res = db_client.table("user_profiles").select("*").in_("id", user_ids).execute()
        profiles = {str(p["id"]): p for p in (profile_res.data or [])}

    resumes = {}
    if resume_ids:
        resume_res = db_client.table("resumes").select("id, raw_content, polished_content, target_job_title").in_("id", resume_ids).execute()
        resumes = {str(r["id"]): r for r in (resume_res.data or [])}

    cover_letters = {}
    if cover_letter_ids:
        cover_res = db_client.table("cover_letters").select("id, title, content, job_position").in_("id", cover_letter_ids).execute()
        cover_letters = {str(c["id"]): c for c in (cover_res.data or [])}

    enriched = []
    for match in matches:
        item = dict(match)
        item["candidate_profile"] = profiles.get(str(match.get("user_id")))
        item["resume"] = resumes.get(str(match.get("resume_id"))) if match.get("resume_id") else None
        item["cover_letter"] = cover_letters.get(str(match.get("cover_letter_id"))) if match.get("cover_letter_id") else None
        enriched.append(item)
    return enriched


@router.get("/all", response_model=List[JobPostingResponse])
async def get_all_jobs(db_client: Client = Depends(db.get_db)):
    return _service(db_client).list_active_jobs()


@router.get("/company/{company_id}", response_model=List[JobPostingResponse])
async def get_company_jobs(company_id: str, db_client: Client = Depends(db.get_db)):
    return _service(db_client).list_company_jobs(company_id)


@router.post("/", response_model=JobPostingResponse)
async def create_job(data: JobPostingCreate, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    return _service(db_client).create_job(user_id, data)


@router.get("/my-jobs", response_model=List[JobPostingResponse])
async def get_my_jobs(db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    return _service(db_client).list_company_jobs(user_id)


@router.patch("/{job_id}")
async def update_job(job_id: str, updates: JobPostingUpdate, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    return _service(db_client).update_job(job_id, user_id, updates)


@router.delete("/{job_id}")
async def delete_job(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    return _service(db_client).delete_job(job_id, user_id)


@router.get("/{job_id}/applicants")
async def get_job_applicants(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _service(db_client).ensure_job_owner(job_id, user_id)

    res = db_client.table("job_matches") \
        .select("*") \
        .eq("job_id", job_id) \
        .in_("status", ["applied", "accepted", "declined", "invited"]) \
        .order("match_score", desc=True).execute()
    return _enrich_matches(db_client, res.data or [])


@router.patch("/{job_id}/applicants/{match_id}/status")
async def update_applicant_status(job_id: str, match_id: str, payload: dict, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    status = payload.get("status")
    if status not in {"applied", "accepted", "declined", "invited", "matched"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    _service(db_client).ensure_job_owner(job_id, user_id)
    res = db_client.table("job_matches").update({"status": status}).eq("id", match_id).eq("job_id", job_id).execute()
    return res.data[0] if res.data else {"status": "updated"}


@router.get("/{job_id}/candidates")
async def get_job_candidates(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _service(db_client).ensure_job_owner(job_id, user_id)

    res = db_client.table("job_matches") \
        .select("*") \
        .eq("job_id", job_id) \
        .order("match_score", desc=True).execute()
    return _enrich_matches(db_client, res.data or [])


@router.post("/{job_id}/invite/{candidate_id}")
async def invite_candidate(job_id: str, candidate_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _service(db_client).ensure_job_owner(job_id, user_id)

    res = db_client.table("job_invitations").insert({
        "job_id": job_id,
        "candidate_id": candidate_id,
        "status": "pending",
    }).execute()
    return res.data[0]
