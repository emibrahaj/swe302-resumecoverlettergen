from uuid import UUID

from supabase import Client

from backend.database.db import db
from backend.models import Resume
from backend.schemas.ResumeSchema import ResumeCreate


class ResumeService:
    def __init__(self, db_client: Client):
        self.supabase = db_client
        self.storage_bucket = db.storage_bucket()
        #^this is the supabase bucket where the pdf resumes are stored

    def get_resume(self, resume_id: UUID):
        #fetches the json data of a single resume from the db
        pass

    def list_user_resumes(self, user_id: UUID):
        #returns a list of all the resumes of a user
        pass

    def save_raw_resume(self, resume_obj: ResumeCreate):
        payload = {
            "user_id": resume_obj.user_id,
            "target_job_title": resume_obj.target_job_title,
            "raw_content": resume_obj.to_dict()
        }

        response = self.supabase.table("resumes").insert(payload).execute()
        return response.data[0]

    def update_polished_content(self, resume_id: UUID, ai_output: dict):
        #saves the polished resume content done by an ai agent to the db
        pass

    def delete_resume(self, resume_id: UUID):
        #deletes a resume from the db and the files associated with it
        pass





