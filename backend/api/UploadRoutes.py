from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from backend.database.db import db_client
from backend.auth.auth_handler import get_current_user
import uuid

router = APIRouter(prefix="/user/profile", tags=["User Profile"])

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    supabase = db_client
    user_id = current_user.id

    file_ext = file.filename.split(".")[-1]
    file_path = f"avatars/{user_id}/{uuid.uuid4()}.{file_ext}"

    file_bytes = await file.read()

    upload_response = supabase.storage.from_("avatars").upload(
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

    return {
        "avatar_url": public_url
    }