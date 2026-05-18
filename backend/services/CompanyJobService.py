from fastapi import HTTPException
from supabase import Client

from backend.schemas.JobSchema import JobPostingCreate, JobPostingUpdate


JOB_SELECT_FIELDS = (
    "id, company_id, company_name, job_title, required_skills, salary, "
    "job_location, employment_type, description, is_active, created_at"
)


class CompanyJobService:
    def __init__(self, db_client: Client):
        self.db_client = db_client

    def require_company_verified(self, company_id: str) -> dict:
        company = (
            self.db_client.table("companies")
            .select("is_verified, company_name")
            .eq("id", company_id)
            .single()
            .execute()
        )
        if not company.data:
            raise HTTPException(status_code=404, detail="Company not found")
        if not company.data.get("is_verified"):
            raise HTTPException(status_code=403, detail="Company not verified")
        return company.data

    def ensure_job_owner(self, job_id: str, company_id: str) -> dict:
        job = (
            self.db_client.table("job_posting")
            .select("id, company_id")
            .eq("id", job_id)
            .single()
            .execute()
        )
        if not job.data or str(job.data["company_id"]) != company_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        return job.data

    def list_active_jobs(self) -> list[dict]:
        res = (
            self.db_client.table("job_posting")
            .select(JOB_SELECT_FIELDS)
            .eq("is_active", True)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []

    def list_company_jobs(self, company_id: str) -> list[dict]:
        res = (
            self.db_client.table("job_posting")
            .select(JOB_SELECT_FIELDS)
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []

    def create_job(self, company_id: str, data: JobPostingCreate) -> dict:
        company = self.require_company_verified(company_id)
        payload = data.model_dump()
        payload["company_id"] = company_id
        payload["company_name"] = company["company_name"]

        res = self.db_client.table("job_posting").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Job was not created")
        return res.data[0]

    def update_job(self, job_id: str, company_id: str, updates: JobPostingUpdate) -> dict:
        self.ensure_job_owner(job_id, company_id)
        payload = updates.model_dump(exclude_none=True)
        if not payload:
            return {"status": "no_changes"}

        res = (
            self.db_client.table("job_posting")
            .update(payload)
            .eq("id", job_id)
            .execute()
        )
        return res.data[0] if res.data else {"status": "updated"}

    def delete_job(self, job_id: str, company_id: str) -> dict:
        self.ensure_job_owner(job_id, company_id)
        self.db_client.table("job_matches").delete().eq("job_id", job_id).execute()
        self.db_client.table("job_invitations").delete().eq("job_id", job_id).execute()
        self.db_client.table("job_posting").delete().eq("id", job_id).execute()
        return {"status": "deleted"}
