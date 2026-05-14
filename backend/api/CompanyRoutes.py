from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.AuthSchema import CompanyRegister, UserLogin, ForgotPasswordRequest
from backend.services.AuthService import AuthService

router = APIRouter(prefix="/company", tags=["Companies"])

APPLICANT_STATUSES = {"applied", "accepted", "declined", "invited"}
BEST_MATCH_THRESHOLD = 85
JOB_SELECT_FIELDS = (
    "id, company_id, company_name, job_title, required_skills, salary, "
    "job_location, employment_type, description, is_active, created_at"
)


def _table_data(res):
    return getattr(res, "data", None) or []


def _single_data(res):
    return getattr(res, "data", None)


@router.post("/register")
async def company_register(data: CompanyRegister, supabase_client: Client = Depends(db.get_db)):
    try:
        result = AuthService(supabase_client).register_company(data)
        return {
            "status": "success",
            "message": "Company registered successfully and is pending verification",
            "company_id": result["company_id"],
            "user": result["user"],
            "company": result.get("company"),
            "profile": result.get("profile"),
        }
    except Exception as e:
        print("COMPANY REGISTER ERROR:", repr(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def company_login(data: UserLogin, supabase_client: Client = Depends(db.get_db)):
    try:
        auth_response = supabase_client.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if not auth_response.user or not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_uuid = str(auth_response.user.id)
        company_response = supabase_client.table("companies").select("*").eq("id", user_uuid).maybe_single().execute()
        if not _single_data(company_response):
            raise HTTPException(status_code=404, detail="Company account not found")

        profile_response = supabase_client.table("company_profiles").select("*").eq("id", user_uuid).maybe_single().execute()

        return {
            "status": "success",
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
            "user": {"id": user_uuid, "email": auth_response.user.email},
            "company": company_response.data,
            "profile": profile_response.data,
            "is_verified": company_response.data.get("is_verified", False),
        }
    except HTTPException:
        raise
    except Exception as e:
        print("COMPANY LOGIN ERROR:", repr(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password")
async def company_forgot_password(data: ForgotPasswordRequest, supabase_client: Client = Depends(db.get_db)):
    try:
        supabase_client.auth.reset_password_for_email(
            data.email,
            options={"redirectTo": "http://localhost:3000/company/reset-password"},
        )
    except Exception as e:
        print("COMPANY FORGOT PASSWORD ERROR:", repr(e))
    return {"message": "If a company account exists for this email, a reset link has been sent."}


def _normalize_company_profile_updates(payload: dict) -> dict:
    aliases = {
        "companyName": "company_name",
        "website": "company_website",
        "location": "address",
        "company_address": "address",
    }
    normalized = {}
    for key, value in (payload or {}).items():
        normalized[aliases.get(key, key)] = value

    allowed = {"company_name", "company_website", "logo_url", "description", "email", "company_address"}
    return {k: v for k, v in normalized.items() if k in allowed}


def _get_company_account(user_id: str, supabase_client: Client) -> dict:
    company_res = supabase_client.table("companies").select("*").eq("id", user_id).maybe_single().execute()
    if not _single_data(company_res):
        raise HTTPException(status_code=404, detail="Company account not found for authenticated user")
    return company_res.data


def _get_or_create_company_profile(user_id: str, supabase_client: Client) -> dict:
    profile_res = supabase_client.table("company_profiles").select("*").eq("id", user_id).maybe_single().execute()
    if _single_data(profile_res):
        return profile_res.data

    company = _get_company_account(user_id, supabase_client)
    payload = {
        "id": user_id,
        "company_id": user_id,
        "company_name": company.get("company_name") or "Company",
        "email": company.get("email") or "",
        "company_website": None,
        "logo_url": None,
        "description": None,
        "company_address": None,
    }
    created_res = supabase_client.table("company_profiles").upsert(payload, on_conflict="id").execute()
    if _table_data(created_res):
        return created_res.data[0]

    reread_res = supabase_client.table("company_profiles").select("*").eq("id", user_id).maybe_single().execute()
    if _single_data(reread_res):
        return reread_res.data

    raise HTTPException(status_code=500, detail="Company profile could not be created")


@router.get("/profile")
async def get_my_company_profile(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    try:
        return _get_or_create_company_profile(user_id, supabase_client)
    except HTTPException:
        raise
    except Exception as e:
        print("GET MY COMPANY PROFILE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch company profile: {str(e)}")


@router.patch("/profile")
async def update_my_company_profile(
    updates: dict,
    current_user=Depends(get_current_user),
    supabase_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    profile_updates = _normalize_company_profile_updates(updates)

    if not profile_updates:
        return _get_or_create_company_profile(user_id, supabase_client)

    try:
        _get_or_create_company_profile(user_id, supabase_client)

        update_res = (
            supabase_client.table("company_profiles")
            .update(profile_updates)
            .eq("id", user_id)
            .execute()
        )

        # Sync company table fields. Do not fail the profile update if these sync writes fail.
        sync_warnings = []
        if "company_name" in profile_updates:
            try:
                supabase_client.table("companies").update({"company_name": profile_updates["company_name"]}).eq("id", user_id).execute()
                supabase_client.table("users").update({"name": profile_updates["company_name"]}).eq("id", user_id).execute()
                supabase_client.table("job_posting").update({"company_name": profile_updates["company_name"]}).eq("company_id", user_id).execute()
            except Exception as sync_error:
                sync_warnings.append(f"company_name sync failed: {sync_error}")
                print("COMPANY NAME SYNC WARNING:", repr(sync_error))

        if "email" in profile_updates:
            try:
                supabase_client.table("companies").update({"email": profile_updates["email"]}).eq("id", user_id).execute()
                supabase_client.table("users").update({"email": profile_updates["email"]}).eq("id", user_id).execute()
            except Exception as sync_error:
                sync_warnings.append(f"email sync failed: {sync_error}")
                print("COMPANY EMAIL SYNC WARNING:", repr(sync_error))

        reread_res = supabase_client.table("company_profiles").select("*").eq("id", user_id).maybe_single().execute()
        if _single_data(reread_res):
            profile = dict(reread_res.data)
            if sync_warnings:
                profile["sync_warnings"] = sync_warnings
            return profile

        if _table_data(update_res):
            return update_res.data[0]

        raise HTTPException(status_code=500, detail="Profile update did not return a saved profile")
    except HTTPException:
        raise
    except Exception as e:
        print("UPDATE COMPANY PROFILE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to update company profile: {str(e)}")


@router.delete("/profile")
async def delete_my_company_account(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)

    try:
        jobs_res = supabase_client.table("job_posting").select("id").eq("company_id", user_id).execute()
        job_ids = [str(job["id"]) for job in _table_data(jobs_res)]

        if job_ids:
            supabase_client.table("job_matches").delete().in_("job_id", job_ids).execute()
            supabase_client.table("job_invitations").delete().in_("job_id", job_ids).execute()
            supabase_client.table("job_posting").delete().eq("company_id", user_id).execute()

        supabase_client.table("company_profiles").delete().eq("id", user_id).execute()
        supabase_client.table("companies").delete().eq("id", user_id).execute()
        supabase_client.table("users").delete().eq("id", user_id).execute()

        auth_deleted = True
        try:
            supabase_client.auth.admin.delete_user(user_id)
        except Exception as auth_error:
            auth_deleted = False
            print("AUTH USER DELETE WARNING:", repr(auth_error))

        return {"status": "deleted", "auth_deleted": auth_deleted}
    except Exception as e:
        print("DELETE COMPANY ACCOUNT ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete company account: {str(e)}")


@router.delete("/deactivate-account")
async def deactivate_account(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    return await delete_my_company_account(current_user, supabase_client)


@router.get("/dashboard")
async def get_company_dashboard(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    company_id = get_user_id(current_user)

    try:
        company_res = supabase_client.table("companies").select("id, company_name, is_verified").eq("id", company_id).maybe_single().execute()
        if not _single_data(company_res):
            raise HTTPException(status_code=404, detail="Company account not found")

        jobs_res = (
            supabase_client.table("job_posting")
            .select(JOB_SELECT_FIELDS)
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .execute()
        )
        jobs = _table_data(jobs_res)
        job_ids = [str(job["id"]) for job in jobs]

        matches = []
        if job_ids:
            matches_res = (
                supabase_client.table("job_matches")
                .select("id, job_id, status, match_score, created_at")
                .in_("job_id", job_ids)
                .execute()
            )
            matches = _table_data(matches_res)

        matches_by_job = {job_id: [] for job_id in job_ids}
        for match in matches:
            job_id = str(match.get("job_id"))
            if job_id in matches_by_job:
                matches_by_job[job_id].append(match)

        enriched_jobs = []
        for job in jobs:
            job_matches = matches_by_job.get(str(job["id"]), [])
            enriched_jobs.append({
                **job,
                "applicants_count": sum(1 for m in job_matches if m.get("status") in APPLICANT_STATUSES),
                "best_matches_count": sum(1 for m in job_matches if float(m.get("match_score") or 0) >= BEST_MATCH_THRESHOLD),
                "positions_filled_count": sum(1 for m in job_matches if m.get("status") == "accepted"),
            })

        return {
            "company": company_res.data,
            "stats": {
                "active_jobs": sum(1 for job in jobs if job.get("is_active")),
                "total_applicants": sum(1 for match in matches if match.get("status") in APPLICANT_STATUSES),
                "best_matches": sum(1 for match in matches if float(match.get("match_score") or 0) >= BEST_MATCH_THRESHOLD),
                "positions_filled": sum(1 for match in matches if match.get("status") == "accepted"),
            },
            "jobs": enriched_jobs,
        }
    except HTTPException:
        raise
    except Exception as e:
        print("COMPANY DASHBOARD ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to load company dashboard: {str(e)}")


@router.get("/profile/{company_id}")
async def get_company_public_profile(company_id: str, supabase_client: Client = Depends(db.get_db)):
    try:
        res = supabase_client.table("company_profiles").select("*").eq("id", company_id).maybe_single().execute()
    except Exception as e:
        print("GET COMPANY PUBLIC PROFILE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch company profile: {str(e)}")

    if not _single_data(res):
        raise HTTPException(status_code=404, detail="Company profile not found")

    return res.data
