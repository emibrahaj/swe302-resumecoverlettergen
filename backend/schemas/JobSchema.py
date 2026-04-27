from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class JobPostingBase(BaseModel):
    job_title: str
    required_skills: List[str]
    is_active: Optional[bool] = True

class JobPostingCreate(JobPostingBase):
    company_id: UUID

class JobPostingResponse(JobPostingBase):
    id: UUID
    company_id: UUID
    company_name: str
    created_at: datetime

    class Config:
        from_attributes = True
