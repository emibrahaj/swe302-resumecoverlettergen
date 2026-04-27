from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.database.db import db, db_client
from backend.schemas.AuthSchema import CompanyRegister, UserLogin

router = APIRouter(prefix="/company", tags=["Companies"])


@router.post("/register")
async def company_register(data: CompanyRegister):
    user_uuid = None

    try:
        auth_response = db_client.auth.sign_up({"email": data.email, "password": data.password})
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Auth registration failed")

        user_uuid = auth_response.user.id

        rpc_params = {"p_company_name": data.company_name, "p_admin_id": user_uuid, "p_email": data.email,
            "p_website": data.company_website, "p_logo": data.logo_url, "p_description": data.description}

        rpc_response = db_client.rpc("register_company_and_admin", rpc_params).execute()

        if hasattr(rpc_response, "error") and rpc_response.error:
            raise RuntimeError(f"Database transaction failed: {rpc_response.error}")

        return {"status": "success", "message": "Company and Profile registered successfully",
            "company_id": rpc_response.data, "user_id": user_uuid}

    except Exception as e:
        print(f"Error in company_register: {str(e)}")

        if user_uuid:
            try:
                db_client.auth.admin.delete_user(user_uuid)
            except Exception as cleanup_err:
                print(f"Cleanup failed: {cleanup_err}")

        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", summary="Company login")
async def company_login(data: UserLogin, supabase_client: Client = Depends(db.get_db)):
    try:
        auth_response = supabase_client.auth.sign_in_with_password({"email": data.email, "password": data.password})

        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_uuid = auth_response.user.id

        profile_response = (
            supabase_client.table("company_profiles").select("*, companies(is_verified)").eq("id", user_uuid).limit(
                1).execute())

        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Company profile not found")

        profile_dict = profile_response.data[0]

        return {"status": "success", "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token, "profile": profile_dict,
            "is_verified": profile_dict.get("companies", {}).get("is_verified", False)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile/{company_id}", summary="View company profile")
async def get_company_public_profile(company_id: str):
    try:
        res = db_client.table("company_profiles").select("*").eq("company_id", company_id).limit(1).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Company profile not found")

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
async def get_all_companies():
    res = db_client.table("companies").select("*").execute()
    return res.data

@router.patch("/update-profile/{company_id}")
async def update_company_profile(company_id: str, updates: dict, db_client: Client = Depends(db.get_db)):
    res = db_client.table("company_profiles").update(updates).eq("id", company_id).execute()
    if "company_name" in updates:
        db_client.table("companies").update({"company_name": updates["company_name"]}).eq("id", company_id).execute()
    return res.data[0]


@router.delete("/deactivate-account")
async def deactivate_account(user_id: str, db_client: Client = Depends(db.get_db)):
    db_client.auth.admin.delete_user(user_id)
    return {"status": "success", "message": "Account and all associated data deleted."}
