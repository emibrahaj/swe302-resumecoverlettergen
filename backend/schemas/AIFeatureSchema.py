from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class CoverLetterGenerateRequest(BaseModel):
    job_position: str
    job_description: Optional[str] = None
    company_name: Optional[str] = None
    resume_id: Optional[UUID] = None
    user_data: Optional[str] = None
    save: bool = True


class MarketStandardsRequest(BaseModel):
    job_title: str
    location: Optional[str] = None


class SkillGapRequest(BaseModel):
    job_title: Optional[str] = None
    market_skills: Optional[List[str]] = None


class CourseRecommendationRequest(BaseModel):
    missing_skills: Optional[List[str]] = None
    job_title: Optional[str] = None
