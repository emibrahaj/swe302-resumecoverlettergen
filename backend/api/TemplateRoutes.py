from fastapi import APIRouter, HTTPException
from backend.database.db import db_client
import json
import re

router = APIRouter(prefix="/templates", tags=["templates"])


def normalize_template(row: dict) -> dict:
    """
    Makes every template return the frontend-friendly shape.

    Database may return:
      style_config: { "file": "template_1.html", "accent": "#f5c518" }

    Frontend expects:
      template_key
      style_config.templateKey
      style_config.primaryColor
      preview_image_url
    """

    if not row:
        return {}

    style_config = row.get("style_config") or {}

    # SQLite can return style_config as JSON text.
    # Supabase/Postgres usually returns it as a dict.
    if isinstance(style_config, str):
        try:
            style_config = json.loads(style_config)
        except Exception:
            style_config = {}

    if not isinstance(style_config, dict):
        style_config = {}

    template_file = (
        style_config.get("file")
        or style_config.get("templateKey")
        or style_config.get("template_key")
        or row.get("template_key")
        or row.get("key")
        or row.get("id")
    )

    accent = (
        style_config.get("accent")
        or style_config.get("primaryColor")
        or style_config.get("primary_color")
        or "#088395"
    )

    normalized_style_config = {
        **style_config,
        "file": template_file,
        "templateKey": template_file,
        "template_key": template_file,
        "accent": accent,
        "primaryColor": accent,
        "primary_color": accent,
    }

    preview_image_url = row.get("preview_image_url")

    # Generate frontend preview image path when DB has null preview_image_url.
    # Converts:
    #   template_1.html -> /html_previews/template1.jpg
    #   template_12.html -> /html_previews/template12.jpg
    if not preview_image_url and template_file:
        match = re.search(r"template_?(\d+)\.html", str(template_file))
        if match:
            preview_image_url = f"/html_previews/template{match.group(1)}.jpg"

    return {
        **row,
        "template_key": template_file,
        "style_config": normalized_style_config,
        "preview_image_url": preview_image_url,
        "is_premium": bool(row.get("is_premium", False)),
    }


def get_templates_from_db() -> list[dict]:
    res = (
        db_client.table("templates")
        .select("*")
        .order("created_at", desc=False)
        .execute()
    )

    rows = res.data or []
    return [normalize_template(row) for row in rows]


@router.get("/")
async def get_all_templates():
    return get_templates_from_db()


@router.get("/select-template")
async def select_templates_alias():
    return get_templates_from_db()


# Must come before /{template_id}
@router.get("/key/{template_key}")
async def get_template_by_key(template_key: str):
    """
    Fetch a single template by generated template_key.

    Works with:
      /templates/key/template_1.html
      /templates/key/template_2.html
      /templates/key/simple_pink
    """

    templates = get_templates_from_db()

    for template in templates:
        style_config = template.get("style_config") or {}

        possible_keys = {
            template.get("template_key"),
            template.get("id"),
            template.get("name"),
            style_config.get("file"),
            style_config.get("templateKey"),
            style_config.get("template_key"),
        }

        if template_key in possible_keys:
            return template

    raise HTTPException(
        status_code=404,
        detail=f"Template '{template_key}' not found",
    )


@router.get("/{template_id}")
async def get_template(template_id: str):
    """
    Fetch a single template by id OR template_key.

    This is safer because the frontend might send:
      actual database id
      template_1.html
      template_2.html
    """

    templates = get_templates_from_db()

    for template in templates:
        style_config = template.get("style_config") or {}

        possible_ids = {
            template.get("id"),
            template.get("template_key"),
            style_config.get("file"),
            style_config.get("templateKey"),
            style_config.get("template_key"),
        }

        if template_id in possible_ids:
            return template

    raise HTTPException(status_code=404, detail="Template not found")