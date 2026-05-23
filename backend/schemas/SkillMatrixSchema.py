from typing import Any, Optional

from pydantic import BaseModel, Field


class DimensionDetail(BaseModel):
    score: int = Field(ge=0, le=100)
    reason: str = ""


class CourseRecommendation(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    provider: Optional[str] = None
    skill_category: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[str] = None
    url: Optional[str] = None
    relevance: Optional[int] = None


class SkillMatrixResponse(BaseModel):
    resume_id: str
    overall: int = Field(ge=0, le=100)
    experience: int = Field(ge=0, le=100)
    education: int = Field(ge=0, le=100)
    technical_skills: int = Field(ge=0, le=100)
    soft_skills: int = Field(ge=0, le=100)
    achievements: int = Field(ge=0, le=100)
    keywords: int = Field(ge=0, le=100)
    formatting: int = Field(ge=0, le=100)
    job_relevance: int = Field(ge=0, le=100)
    dimensions: dict[str, DimensionDetail] = Field(default_factory=dict)
    feedback_id: Optional[str] = None
    created_at: Optional[str] = None
    # Extra context for the Resume Analyzer page (derived from the same content).
    missing_skills: list[str] = Field(default_factory=list)
    matching_skills: list[str] = Field(default_factory=list)
    recommended_courses: list[CourseRecommendation] = Field(default_factory=list)
    target_job_title: Optional[str] = None
