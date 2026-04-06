from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.database.db import db

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/profile-picture/{user_id}", summary="Upload a profile picture")
async def upload_resume(user_id: str, file: UploadFile = File(...)):
    supabase = db.get_db()
    try:
        file_content = await file.read()
        file_path = f"{user_id}/{file.filename}"

        supabase.storage.from_("profile-pictures").upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )

        public_url = supabase.storage.from_("profile-pictures").get_public_url(file_path)
        return {"url": public_url}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")