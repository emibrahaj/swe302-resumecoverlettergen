from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.AuthSchema import UserRegister, UserLogin, ResetPasswordSchema, ForgotPasswordRequest
from backend.services.AuthService import AuthService
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
            "message": "User registered successfully",
            "user": res.user,
            "access_token": getattr(getattr(res, "session", None), "access_token", None),
            "refresh_token": getattr(getattr(res, "session", None), "refresh_token", None),
            "token_type": "bearer",
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
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": res.user,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db_client: Client = Depends(db.get_db)):
    try:
        db_client.auth.reset_password_for_email(
            data.email,
            options={"redirectTo": "http://localhost:3000/reset-password"}
        )
    except Exception as e:
        print(str(e))
    return {"message": "If an account exists for this email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordSchema, db_client: Client = Depends(db.get_db), current_user=Depends(get_current_user)):
    try:
        db_client.auth.update_user({"password": data.new_password})
        return {"message": "Password reset successfully.", "user_id": get_user_id(current_user)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
