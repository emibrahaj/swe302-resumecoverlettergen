from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CoverLetterCreate(BaseModel):
    title: str
    content: str
    type: str
    job_position: str
    resume_id: Optional[UUID] = None


class CoverLetterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    job_position: Optional[str] = None
    resume_id: Optional[UUID] = None

    model_config = ConfigDict(extra="forbid")