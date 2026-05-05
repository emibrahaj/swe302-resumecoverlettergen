from fastapi import APIRouter, HTTPException
from backend.database.db import db_client

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/")
async def get_all_templates():
    res = db_client.table("templates").select("*").order("created_at", desc=True).execute()
    return res.data


@router.get("/select-template")
async def select_templates_alias():
    res = db_client.table("templates").select("*").order("created_at", desc=True).execute()
    return res.data


@router.get("/{template_id}")
async def get_template(template_id: str):
    res = db_client.table("templates").select("*").eq("id", template_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Template not found")
    return res.data
