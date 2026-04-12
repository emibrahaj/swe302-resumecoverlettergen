from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.database.db import db, db_client
from backend.schemas.AuthSchema import CompanyRegister, UserLogin

router = APIRouter(prefix="/company", tags=["Companies"])


@router.post("/register")
async def company_register(data: CompanyRegister):
    try:
        auth_response = db_client.auth.sign_up({"email": data.email, "password": data.password})
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to register company")

        user_uuid = auth_response.user.id
        company_data = {"email": data.email, "company_name": data.company_name, "is_verified": False}

        company_response = db_client.table("companies").insert(company_data).execute()
        if not company_response.data:
            raise RuntimeError("Failed to create company profile")

        new_company_id = company_response.data[0]["id"]

        profile_data = {"id": user_uuid, "company_id": new_company_id, "company_name": data.company_name,
            "email": data.email, "company_website": data.company_website, "logo_url": data.logo_url,
            "description": data.description}
        db_client.table("company_profiles").insert(profile_data).execute()
        return {"status": "success", "message": "Company and Profile registered successfully",
            "company_id": new_company_id, "profile_id": user_uuid}
    except Exception as e:
        print(f"Error in company_register: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", summary="Company login")
async def company_login(data: UserLogin, db_client: Client = Depends(db.get_db)):
    try:
        auth_response = db_client.auth.sign_in_with_password({"email": data.email, "password": data.password})

        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_uuid = auth_response.user.id

        profile_response = db_client.table("company_profiles").select("*, companies(is_verified)").eq("id",
                                                                                                      user_uuid).limit(
            1).execute()
        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Company profile not found")

        profile_dict = profile_response.data[0] if profile_response.data else {}

        return {
            "status": "success",
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "profile": profile_dict,
            "is_verified": profile_dict.get("companies", {}).get("is_verified", False)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile/{company_id}", summary="View company profile")
async def get_company_public_profile(company_id: str):
    try:
        res = (db_client.table("company_profiles").select("*").eq("id", company_id).limit(1).execute())
        if not res.data:
            raise HTTPException(status_code=404, detail="Company profile not found")

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
