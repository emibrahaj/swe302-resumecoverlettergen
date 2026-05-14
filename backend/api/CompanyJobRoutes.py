from typing import List

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.JobSchema import JobPostingCreate, JobPostingResponse, JobPostingUpdate

router = APIRouter(prefix="/company/jobs", tags=["Company Jobs"])


def _require_company_verified(db_client: Client, company_id: str):
    company = db_client.table("companies").select("is_verified, company_name").eq("id", company_id).single().execute()
    if not company.data:
        raise HTTPException(status_code=404, detail="Company not found")
    if not company.data.get("is_verified"):
        raise HTTPException(status_code=403, detail="Company not verified")
    return company.data


def _ensure_job_owner(db_client: Client, job_id: str, company_id: str):
    job = db_client.table("job_posting").select("company_id").eq("id", job_id).single().execute()
    if not job.data or str(job.data["company_id"]) != company_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return job.data


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
    jobs = db_client.table("job_posting").select("*").eq("is_active", True).order("created_at", desc=True).execute()
    return jobs.data


@router.get("/company/{company_id}", response_model=List[JobPostingResponse])
async def get_company_jobs(company_id: str, db_client: Client = Depends(db.get_db)):
    res = db_client.table("job_posting").select("*").eq("company_id", company_id).execute()
    return res.data


@router.post("/", response_model=JobPostingResponse)
async def create_job(data: JobPostingCreate, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    company = _require_company_verified(db_client, user_id)

    job_dict = data.model_dump()
    job_dict["company_id"] = user_id
    job_dict["company_name"] = company["company_name"]

    job_response = db_client.table("job_posting").insert(job_dict).execute()
    return job_response.data[0]


@router.get("/my-jobs", response_model=List[JobPostingResponse])
async def get_my_jobs(db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    res = db_client.table("job_posting").select("*").eq("company_id", user_id).order("created_at", desc=True).execute()
    return res.data


@router.patch("/{job_id}")
async def update_job(job_id: str, updates: JobPostingUpdate, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _ensure_job_owner(db_client, job_id, user_id)

    payload = updates.model_dump(exclude_none=True)
    if not payload:
        return {"status": "no_changes"}
    res = db_client.table("job_posting").update(payload).eq("id", job_id).execute()
    return res.data[0] if res.data else {"status": "updated"}


@router.delete("/{job_id}")
async def delete_job(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _ensure_job_owner(db_client, job_id, user_id)
    db_client.table("job_posting").delete().eq("id", job_id).execute()
    return {"status": "deleted"}


@router.get("/{job_id}/applicants")
async def get_job_applicants(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _ensure_job_owner(db_client, job_id, user_id)

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

    _ensure_job_owner(db_client, job_id, user_id)
    res = db_client.table("job_matches").update({"status": status}).eq("id", match_id).eq("job_id", job_id).execute()
    return res.data[0] if res.data else {"status": "updated"}


@router.get("/{job_id}/candidates")
async def get_job_candidates(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _ensure_job_owner(db_client, job_id, user_id)

    res = db_client.table("job_matches") \
        .select("*") \
        .eq("job_id", job_id) \
        .order("match_score", desc=True).execute()
    return _enrich_matches(db_client, res.data or [])


@router.post("/{job_id}/invite/{candidate_id}")
async def invite_candidate(job_id: str, candidate_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _ensure_job_owner(db_client, job_id, user_id)

    res = db_client.table("job_invitations").insert({
        "job_id": job_id,
        "candidate_id": candidate_id,
        "status": "pending",
    }).execute()
    return res.data[0]
