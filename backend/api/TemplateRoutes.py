from fastapi import APIRouter, HTTPException
from backend.database.db import db_client

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/")
async def get_all_templates():
    res = db_client.table("templates").select("*").order("created_at", desc=False).execute()
    return res.data


@router.get("/select-template")
async def select_templates_alias():
    res = db_client.table("templates").select("*").order("created_at", desc=False).execute()
    return res.data


# Must come before /{template_id} so FastAPI doesn't treat "key" as a UUID
@router.get("/key/{template_key}")
async def get_template_by_key(template_key: str):
    """Fetch a single template by its human-readable template_key slug (e.g. 'simple_pink')."""
    res = (
        db_client.table("templates")
        .select("*")
        .eq("template_key", template_key)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail=f"Template '{template_key}' not found")
    return res.data


@router.get("/{template_id}")
async def get_template(template_id: str):
    res = db_client.table("templates").select("*").eq("id", template_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Template not found")
    return res.data