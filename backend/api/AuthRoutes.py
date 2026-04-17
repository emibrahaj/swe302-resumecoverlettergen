from fastapi import APIRouter, HTTPException, Depends
from backend.services.AuthService import AuthService
from backend.schemas.AuthSchema import UserRegister, UserLogin
from backend.database.db import db
from supabase import Client
from backend.services.ResumeService import ResumeService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def sign_up(user_data: UserRegister, db_client: Client = Depends(db.get_db), pending_resume_id: str = None):
    resume_service = ResumeService(db_client)
    try:
        auth_service = AuthService(db_client)
        res = auth_service.register(user_data)
        if pending_resume_id:
            resume_service.claim_resume(pending_resume_id, res.user.id)
            return {
                "status": "success",
                "message": "User registered successfully and resume claimed",
                "user": res.user
            }
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": res.user
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def log_in(credentials: UserLogin, db_client: Client = Depends(db.get_db)):
    try:
        auth_service = AuthService(db_client)
        res = auth_service.login(credentials)
        return {
            "status": "success",
            "message": "User logged in successfully",
            "token_type": "bearer",
            "user": res.user,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

print("Registered routes:", router.routes)