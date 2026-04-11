import os
from supabase import Client, create_client
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        self.key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

        if not self.url or not self.key:
            raise ValueError("Missing Supabase URL or key in environment variables.")

        self.client: Client = create_client(self.url, self.key)
        self.bucket_name = "resumes-pdfs"

    def get_db(self) -> Client:
        return self.client

    def storage_bucket(self):
        return self.client.storage.from_(self.bucket_name)

db = Database()
db_client = db.get_db()