from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CoverLetterCreate(BaseModel):
    title: str
    content: str
    type: str
    job_position: str
    resume_id: Optional[UUID] = None