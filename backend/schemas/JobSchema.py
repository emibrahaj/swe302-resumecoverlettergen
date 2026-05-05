from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class JobPostingBase(BaseModel):
    job_title: str
    required_skills: List[str]
    is_active: Optional[bool] = True


class JobPostingCreate(JobPostingBase):
    # company_id is taken from the authenticated company user on the backend.
    pass


class JobPostingUpdate(BaseModel):
    job_title: Optional[str] = None
    required_skills: Optional[List[str]] = None
    is_active: Optional[bool] = None


class JobPostingResponse(JobPostingBase):
    id: UUID
    company_id: UUID
    company_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class JobApplicationCreate(BaseModel):
    resume_id: Optional[UUID] = None
    cover_letter_id: Optional[UUID] = None
