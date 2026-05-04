from fastapi import APIRouter, HTTPException, Depends
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
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def company_login(data: UserLogin, supabase_client: Client = Depends(db.get_db)):
    try:
        auth_response = supabase_client.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_uuid = auth_response.user.id
        company_response = supabase_client.table("companies").select("*").eq("id", user_uuid).single().execute()
        if not company_response.data:
            raise HTTPException(status_code=404, detail="Company account not found")

        profile_response = supabase_client.table("company_profiles").select("*").eq("id", user_uuid).single().execute()

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


@router.get("/profile")
async def get_my_company_profile(current_user=Depends(get_current_user), supabase_client: Client = Depends(db.get_db)):
    user_id = get_user_id(current_user)
    res = supabase_client.table("company_profiles").select("*").eq("id", user_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return res.data


@router.get("/profile/{company_id}")
async def get_company_public_profile(company_id: str, supabase_client: Client = Depends(db.get_db)):
    res = supabase_client.table("company_profiles").select("*").eq("id", company_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return res.data


@router.get("/all")
async def get_all_companies(supabase_client: Client = Depends(db.get_db)):
    res = supabase_client.table("companies").select("*").execute()
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
