from typing import List

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.JobSchema import JobPostingCreate, JobPostingResponse, JobPostingUpdate
from backend.services.CompanyJobService import CompanyJobService
from backend.services.MatchingService import MatchingService

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


@router.get("/{job_id}/best-matches")
async def get_job_best_matches(job_id: str, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _service(db_client).ensure_job_owner(job_id, user_id)

    # Fetch required skills + title for this job. The title is needed so company-side
    # scoring applies the same title-match floor the user/apply flows use — otherwise
    # the same resume/job pair shows a lower % here than on the candidate's board.
    job_res = db_client.table("job_posting").select("required_skills, job_title").eq("id", job_id).maybe_single().execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")
    required_skills = job_res.data.get("required_skills") or []
    job_title = job_res.data.get("job_title") or ""

    # Find users already in a non-reversible status (exclude them from matches)
    existing_res = db_client.table("job_matches").select("user_id, status, id, match_score, resume_id").eq("job_id", job_id).execute()
    existing_by_user: dict = {str(m["user_id"]): m for m in (existing_res.data or [])}
    excluded_statuses = {"applied", "accepted", "declined", "invited"}
    excluded_users = {uid for uid, m in existing_by_user.items() if m.get("status") in excluded_statuses}

    # Fetch all resumes, most recent per user
    resumes_res = db_client.table("resumes").select("id, user_id, raw_content, polished_content, target_job_title, created_at").order("created_at", desc=True).execute()
    seen_users: set = set()
    unique_resumes = []
    for r in (resumes_res.data or []):
        uid = str(r.get("user_id") or "")
        if uid and uid not in seen_users and uid not in excluded_users:
            seen_users.add(uid)
            unique_resumes.append(r)

    # Score each resume against the job's required skills
    def _extract_skills(resume: dict) -> list[str]:
        content = resume.get("polished_content") or resume.get("raw_content") or {}
        if not isinstance(content, dict):
            return []
        raw_skills = content.get("skills") or []
        names = []
        for s in raw_skills:
            if isinstance(s, dict):
                names.append(s.get("skill_name") or s.get("name") or "")
            else:
                names.append(str(s))
        return [n for n in names if n]

    MIN_SCORE = 0.4
    scored = []
    for resume in unique_resumes:
        user_skills = _extract_skills(resume)
        score = MatchingService.calculate_score(
            user_skills,
            required_skills,
            resume_job_title=resume.get("target_job_title") or "",
            job_title=job_title,
        )
        if score < MIN_SCORE:
            continue
        uid = str(resume.get("user_id") or "")
        existing = existing_by_user.get(uid)
        scored.append({
            "id": existing["id"] if existing else None,
            "user_id": uid,
            "job_id": job_id,
            "resume_id": str(resume["id"]),
            "cover_letter_id": None,
            "match_score": score,
            "status": existing["status"] if existing else "matched",
            "created_at": resume.get("created_at"),
        })

    # Sort by score desc, cap at 50
    scored.sort(key=lambda m: m["match_score"], reverse=True)
    top = scored[:50]

    # Persist new 'matched' rows so the dashboard count stays accurate.
    for item in top:
        if item.get("id") is None:
            try:
                db_client.table("job_matches").insert({
                    "user_id": item["user_id"],
                    "job_id": job_id,
                    "resume_id": item["resume_id"],
                    "match_score": item["match_score"],
                    "status": "matched",
                }).execute()
            except Exception:
                pass

    return _enrich_matches(db_client, top)


@router.post("/{job_id}/invite")
async def invite_candidate(job_id: str, payload: dict, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    _service(db_client).ensure_job_owner(job_id, user_id)

    candidate_user_id = payload.get("user_id")
    resume_id = payload.get("resume_id")
    match_score = float(payload.get("match_score") or 0.0)

    if not candidate_user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    existing = db_client.table("job_matches").select("id").eq("job_id", job_id).eq("user_id", candidate_user_id).maybe_single().execute()
    if existing.data:
        res = db_client.table("job_matches").update({"status": "invited"}).eq("id", existing.data["id"]).execute()
    else:
        res = db_client.table("job_matches").insert({
            "user_id": candidate_user_id,
            "job_id": job_id,
            "resume_id": resume_id,
            "status": "invited",
            "match_score": match_score,
        }).execute()

    return res.data[0] if res.data else {"status": "invited"}