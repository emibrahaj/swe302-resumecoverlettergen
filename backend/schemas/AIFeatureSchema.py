from typing import Optional, Dict, Any, List
from uuid import UUID

from pydantic import BaseModel


class MarketStandardsRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = None


class CoverLetterGenerateRequest(BaseModel):
    title: Optional[str] = None
    job_position: str
    company_name: Optional[str] = None
    resume_id: Optional[UUID] = None
    user_input: Optional[str] = None
    type: Optional[str] = "ai_generated"
    language: Optional[str] = "en"


class CourseUsageRequest(BaseModel):
    course_ids: List[UUID]


class ResumeSkillGapRequest(BaseModel):
    market_skills: Optional[List[str]] = None
    market_insights: Optional[Dict[str, Any]] = None
