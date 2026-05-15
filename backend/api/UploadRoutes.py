from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from backend.database.db import db_client
from backend.auth.auth_handler import get_current_user
import uuid

router = APIRouter(prefix="/upload", tags=["Uploads"])


def _ensure_bucket(supabase, bucket_name: str):
    """Create the storage bucket if it doesn't already exist."""
    try:
        supabase.storage.create_bucket(bucket_name, options={"public": True})
    except Exception:
        pass  # Already exists — that's fine


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    supabase = db_client
    user_id = current_user.id

    _ensure_bucket(supabase, "avatars")

    file_ext = file.filename.split(".")[-1]
    file_path = f"avatars/{user_id}/{uuid.uuid4()}.{file_ext}"

    file_bytes = await file.read()

    supabase.storage.from_("avatars").upload(
        file_path,
        file_bytes,
        {
            "content-type": file.content_type,
            "upsert": "true",
        },
    )

    public_url = supabase.storage.from_("avatars").get_public_url(file_path)

    supabase.table("user_profiles").update({
        "avatar_url": public_url,
    }).eq("id", user_id).execute()

    return {"avatar_url": public_url}


@router.post("/company-logo")
async def upload_company_logo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload a company logo. Returns the public URL to store in company_profiles.logo_url."""
    supabase = db_client
    user_id = str(current_user.id)

    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Unsupported image type. Use JPEG, PNG, WEBP, GIF, or SVG.")

    file_ext = (file.filename or "logo").rsplit(".", 1)[-1].lower() or "png"
    file_path = f"logos/{user_id}/{uuid.uuid4()}.{file_ext}"

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:  # 5 MB cap
        raise HTTPException(status_code=413, detail="Logo file must be under 5 MB.")

    _ensure_bucket(supabase, "logos")

    supabase.storage.from_("logos").upload(
        file_path,
        file_bytes,
        {"content-type": file.content_type, "upsert": "true"},
    )

    public_url = supabase.storage.from_("logos").get_public_url(file_path)

    # Persist the URL directly into company_profiles so it survives page reloads
    supabase.table("company_profiles").update({"logo_url": public_url}).eq("id", user_id).execute()

    return {"url": public_url}