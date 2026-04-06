from fastapi import APIRouter, HTTPException, Depends
from backend.services.AuthService import AuthService
from backend.schemas.AuthSchema import UserRegister, UserLogin
from backend.database.db import db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def sign_up(user_data: UserRegister, db: Session = Depends(db.get_db)):
    try:
        auth_service = AuthService(db)
        res = auth_service.register(user_data)
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": res.user
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def log_in(credentials: UserLogin, db: Session = Depends(db.get_db)):
    try:
        auth_service = AuthService(db)
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