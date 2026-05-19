import uuid
from typing import List

from fastapi import APIRouter, Depends
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.ReviewSchema import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse)
async def submit_review(
    payload: ReviewCreate,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "rating": payload.rating,
        "text": payload.text,
        "name": payload.name,
        "role": payload.role,
        "is_approved": True,
    }
    res = db_client.table("reviews").insert(record).execute()
    return res.data[0]


@router.get("/", response_model=List[ReviewResponse])
async def list_reviews(db_client: Client = Depends(db.get_db)):
    """Public endpoint — returns all approved reviews, newest first."""
    res = (
        db_client.table("reviews")
        .select("*")
        .eq("is_approved", True)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return res.data or []
