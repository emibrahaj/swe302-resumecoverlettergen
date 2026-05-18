from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=1, max_length=2000)
    name: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=120)


class ReviewResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    rating: int
    text: str
    name: str
    role: str
    is_approved: bool
    created_at: str

    class Config:
        from_attributes = True
