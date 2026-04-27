from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CompanyRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: str
    company_website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = Field(None, min_length=100)

class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    company_id: Optional[str] = None