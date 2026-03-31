from uuid import UUID
from backend.database import db

class ResumeService:
    def __init__(self):
        self.db_client = db.get_db()
        self.storage_bucket = db.storage_bucket()
        #^this is the supabase bucket where the pdf resumes are stored

    def get_resume(self, resume_id: UUID):
        #fetches the json data of a single resume from the db
        pass

    def list_user_resumes(self, user_id: UUID):
        #returns a list of all the resumes of a user
        pass

    def save_raw_resume(self, user_id: UUID, content: dict):
        #validates and inserts initial user data
        pass

    def update_polished_content(self, resume_id: UUID, ai_output: dict):
        #saves the polished resume content done by an ai agent to the db
        pass

    def delete_resume(self, resume_id: UUID):
        #deletes a resume from the db and the files associated with it
        pass





