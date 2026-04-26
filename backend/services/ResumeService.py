from uuid import UUID

from fastapi import HTTPException
from supabase import Client

from backend.schemas.ResumeSchema import ResumeCreate


class ResumeService:
    def __init__(self, db_client: Client):
        self.supabase = db_client
        self.storage_bucket = "profile-pictures"
        self.table = "resumes"

    def get_resume(self, resume_id: UUID):
        response = self.supabase.table(self.table).select("*").eq("id", str(resume_id)).single().execute()
        return response.data

    def list_user_resumes(self, user_id: UUID):
        response = self.supabase.table(self.table).select("*").eq("user_id", str(user_id)).order("created_at",
                                                                                                 desc=True).execute()
        return response.data

    def save_raw_resume(self, resume_obj: ResumeCreate) -> dict:
        payload = {"user_id": str(resume_obj.user_id) if resume_obj.user_id else None,
                   "template_id": resume_obj.template_id,
                   "target_job_title": resume_obj.target_job_title,
                   "raw_content": resume_obj.model_dump(mode="json")}
        response = self.supabase.table(self.table).insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save resume")
        return response.data[0]

    def update_polished_content(self, resume_id: UUID, ai_output: dict):
        response = self.supabase.table(self.table).update({"polished_content": ai_output, "updated_at": "now()"}).eq(
            "id", str(resume_id)).execute()
        return response.data[0] if response.data else None

    def delete_resume(self, resume_id: UUID):
        resume = self.get_resume(resume_id)

        if resume and resume.get("avatar_url"):
            file_path = resume["avatar_url"].split("/")[-1]
            try:
                self.supabase.storage.from_(self.storage_bucket).remove([file_path])
            except Exception as e:
                print(f"Error deleting file: {e}")

        response = self.supabase.table(self.table).delete().eq("id", str(resume_id)).execute()
        return {"status": "success", "deleted_id": str(resume_id), "response": response.data[0]}

    def claim_resume(self, resume_id: str, user_id: str):
        resume = self.get_resume(resume_id)

        raw = resume.get("raw_content", {})
        polished = resume.get("polished_content", {})

        raw["user_id"] = user_id
        if polished:
            polished["user_id"] = user_id

        return self.supabase.table(self.table).update({
            "user_id": user_id,
            "raw_content": raw,
            "polished_content": polished
        }).eq("id", resume_id).execute()

    def update_manual_edits(self, resume_id: str, edited_content: dict):
        return self.supabase.table(self.table).update({
            "polished_content": edited_content,
            "updated_at": "now()"
        }).eq("id", resume_id).execute()