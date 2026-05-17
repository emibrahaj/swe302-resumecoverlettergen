from fastapi import APIRouter, HTTPException, Depends, Request
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db, db_client
from backend.schemas.AuthSchema import CompanyRegister, UserLogin, ForgotPasswordRequest
from backend.services.AuthService import AuthService

router = APIRouter(prefix="/company", tags=["Companies"])

@router.post("/register")
async def company_register(data: CompanyRegister, supabase_client: Client = Depends(db.get_db)):
    try:
        result = AuthService(supabase_client).register_company(data)
        return {
            "status": "success",
            "message": "Company registered successfully and is pending verification",
            "company_id": result["company_id"],
            "user": result["user"],
        }
    except Exception as e:
        print("COMPANY REGISTER ERROR:", repr(e))
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def company_login(data: UserLogin, supabase_client: Client = Depends(db.get_db)):
    try:
        auth_response = supabase_client.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_uuid = auth_response.user.id
        company_response = supabase_client.table("companies").select("*").eq("id", user_uuid).maybe_single().execute()
        if not company_response.data:
            raise HTTPException(status_code=404, detail="Company account not found")

        profile_response = supabase_client.table("company_profiles").select("*").eq("id", user_uuid).maybe_single().execute()

        return {
            "status": "success",
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
            "user": auth_response.user,
            "company": company_response.data,
            "profile": profile_response.data,
            "is_verified": company_response.data.get("is_verified", False),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password")
async def company_forgot_password(data: ForgotPasswordRequest, supabase_client: Client = Depends(db.get_db)):
    try:
        supabase_client.auth.reset_password_for_email(
            data.email,
            options={"redirectTo": "http://localhost:3000/company/reset-password"}
        )
    except Exception as e:
        print(str(e))
    return {"message": "If a company account exists for this email, a reset link has been sent."}


@router.get("/profile/{company_id}")
async def get_company_public_profile(company_id: str, supabase_client: Client = Depends(db.get_db)):
    res = supabase_client.table("company_profiles").select("*").eq("id", company_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return res.data


@router.get("/profile")
async def get_my_company_profile(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)

    try:
        res = (
            supabase_client
            .table("company_profiles")
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        print("GET MY COMPANY PROFILE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail="Failed to fetch company profile")

    if res is None:
        raise HTTPException(status_code=500, detail="Database query returned no response")

    if not getattr(res, "data", None):
        raise HTTPException(status_code=404, detail="Company profile not found")

    return res.data


@router.get("/profile/{company_id}")
async def get_company_public_profile(company_id: str, supabase_client: Client = Depends(db.get_db)):
    try:
        res = (
            supabase_client
            .table("company_profiles")
            .select("*")
            .eq("id", company_id)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        print("GET COMPANY PUBLIC PROFILE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail="Failed to fetch company profile")

    if res is None:
        raise HTTPException(status_code=500, detail="Database query returned no response")

    if not getattr(res, "data", None):
        raise HTTPException(status_code=404, detail="Company profile not found")

    return res.data


@router.patch("/profile")
async def update_my_company_profile(updates: dict, current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    allowed_profile_fields = {"company_name", "company_website", "logo_url", "description", "email"}
    profile_updates = {k: v for k, v in updates.items() if k in allowed_profile_fields}
    if not profile_updates:
        return {"status": "no_changes", "message": "No supported profile fields provided."}

    res = supabase_client.table("company_profiles").update(profile_updates).eq("id", user_id).execute()
    if "company_name" in profile_updates:
        supabase_client.table("companies").update({"company_name": profile_updates["company_name"]}).eq("id", user_id).execute()
        supabase_client.table("users").update({"name": profile_updates["company_name"]}).eq("id", user_id).execute()
    return res.data[0] if res.data else {"status": "updated"}

@router.delete("/deactivate-account")
async def deactivate_account(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    supabase_client.auth.admin.delete_user(user_id)
    return {"status": "success", "message": "Account and associated auth user deleted."}

# async def get_current_user(request: Request, supabase_client: Client = Depends(db.get_db)):
#     auth_header = request.headers.get("Authorization")
#     if not auth_header or not auth_header.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Missing / invalid token")
#
#     token = auth_header.split(" ", 1)[1].strip()
#     if not token:
#         raise HTTPException(status_code=401, detail="Missing / invalid token")
#
#     try:
#         user_response = supabase_client.auth.get_user(token)
#     except Exception as exc:
#         raise HTTPException(status_code=401, detail="Invalid or expired token") from exc
#
#     if not user_response or not user_response.user:
#         raise HTTPException(status_code=401, detail="Invalid session")
#
#     return user_response.user
#
# def get_User_id(current_user) -> str:
#     return str(getattr(current_user, "id", None) or current_user.get("id"))

@router.get("/dashboard")
async def get_company_dashboard(
    current_user=Depends(get_current_user),
    supabase_client: Client = Depends(db.get_db),
):
    user_id = str(current_user.id)  # use user id directly

    # company_id is the same as user id
    company_id = user_id

    # Fetch company info
    company = supabase_client.table("companies").select("*").eq("id", company_id).maybe_single().execute().data
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Fetch job postings
    jobs = supabase_client.table("job_posting").select("*").eq(
        "company_id", company_id).execute().data or []

    job_ids = [job["id"] for job in jobs if job.get("id")]

    if job_ids:
        matches = (
                supabase_client
                .table("job_matches")
                .select("*")
                .in_("job_id", job_ids)
                .execute()
                .data
                or []
        )
    else:
        matches = []

    # Per-job aggregates
    from collections import defaultdict
    applicants_by_job: dict = defaultdict(int)
    matches_by_job: dict = defaultdict(int)
    for m in matches:
        jid = str(m.get("job_id", ""))
        if m.get("status") in ("applied", "accepted", "declined", "invited"):
            applicants_by_job[jid] += 1
        if (m.get("match_score") or 0) >= 0.5:
            matches_by_job[jid] += 1

    # Build stats
    stats = {
        "active_jobs": sum(1 for j in jobs if j.get("is_active")),
        "total_applicants": sum(applicants_by_job.values()),
        "best_matches": sum(matches_by_job.values()),
        "positions_filled": sum(1 for m in matches if m.get("status") == "accepted"),
    }

    enriched_jobs = [
        {
            **job,
            "applicants_count": applicants_by_job[str(job["id"])],
            "best_matches_count": matches_by_job[str(job["id"])],
        }
        for job in jobs
    ]

    return {
        "company": {
            "id": company["id"],
            "company_name": company["company_name"],
            "is_verified": company.get("is_verified", False),
        },
        "stats": stats,
        "jobs": enriched_jobs,
    }