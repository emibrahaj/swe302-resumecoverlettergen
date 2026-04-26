from fastapi import APIRouter, Depends
from backend.database.db import db, db_client

router = APIRouter(prefix="/template", tags=["templates"])

@router.get("/select-template")
async def get_all_templates():
    res = db_client.table("templates").select("*").execute()
    return res.data

@router.get("/{template_id}")
async def get_template(template_id: str):
    res = db_client.table("templates").select("*").eq("id", template_id).single().execute()
    return res.data