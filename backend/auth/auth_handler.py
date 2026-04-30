from fastapi import Request, HTTPException, Depends
from supabase import Client
from backend.database.db import db


async def get_current_user(request: Request, db: Client = Depends(db.get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing / invalid token")

    token = auth_header.split(" ")[1]
    user = db.auth.get_user(token)
    if not user or not user.user:
        raise HTTPException(status_code=401, detail="Invalid session")
    return user.user

async def require_pro_tier(current_user = Depends(get_current_user), db_client = Depends(db.get_db)):
    user_record = db_client.table("users").select("tier").eq("id", current_user["id"]).single().execute()
    if not user_record.data:
        raise HTTPException(status_code=403, detail="Access denied. Pro tier required.")

    user_tier = user_record.data.get("tier", "free").lower()
    if user_tier != "pro":
        raise HTTPException(status_code=402, detail="Access denied. Pro tier required.")
    return current_user
