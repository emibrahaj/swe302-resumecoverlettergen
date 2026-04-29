from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from backend.database.db import db
from backend.auth.auth_handler import get_current_user
from backend.schemas.CoverLetterSchema import CoverLetterCreate


router = APIRouter(prefix="/cover-letters", tags=["Cover Letters"])

@router.post("/", response_model=dict)
async def create_cover_letter(data: CoverLetterCreate, current_user: dict = Depends(get_current_user), db_client: Client = Depends(db.get_db)):
    payload = data.model_dump()
    payload["user_id"] = current_user["id"]

    res = db_client.table("cover_letters").insert(payload).execute()
    return res.data[0]

@router.get("/", response_model=List[dict])
async def get_my_cover_letters(current_user: dict = Depends(get_current_user), db_client: Client = Depends(db.get_db)):
    res = db_client.table("cover_letters").select("*").eq("user_id", current_user["id"]).execute()
    return res.data

@router.get("/{cover_letter_id}")
async def get_cover_letter(id: UUID, db_client: Client = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    res = db_client.table("cover_letters").select("*").eq("id", id).eq("user_id", current_user["id"]).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Cover Letter not found")
    return res.data

@router.patch("/{cover_letter_id}")
async def update_cover_letter(id: UUID, updates: dict, db_client: Client = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    res = db_client.table("cover_letters").update(updates).eq("id", id).eq("user_id", current_user["id"]).execute()
    return res.data[0]

@router.delete("/{cover_letter_id}")
async def delete_cover_letter(id: UUID, db_client: Client = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    res = db_client.table("cover_letters").delete().eq("id", id).eq("user_id", current_user["id"]).execute()
    return (
        {"status": "success", "message": "Cover Letter deleted successfully"}
        if res.data
        else {"status": "error", "message": "Cover Letter not found"}
    )