from typing import Optional

from pydantic import BaseModel, Field


class DimensionDetail(BaseModel):
    score: int = Field(ge=0, le=100)
    reason: str = ""


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
