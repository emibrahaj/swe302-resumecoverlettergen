import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from backend.services.ResumeService import ResumeService
from backend.api.AuthRoutes import router as auth_router
from backend.api.ResumeRoutes import router as resume_router
from backend.api.UploadRoutes import router as upload_router
from backend.api.CompanyRoutes import router as company_router
from backend.api.CompanyJobRoutes import router as company_jobs_router
from backend.api.UserJobRoutes import router as user_jobs_router
from backend.api.ApplicationRoutes import router as applications_router
from backend.api.CoverLetterRoutes import router as cover_letters_router
from backend.api.DashboardRoutes import router as dashboard_router
from backend.api.TemplateRoutes import router as templates_router
from backend.api.AIFeatureRoutes import router as ai_router
from backend.api.SkillMatrixRoutes import router as skill_matrix_router
from backend.api.PaymentRoutes import router as payments_router
from backend.api.ContactRoutes import router as contact_router
from backend.api.UserRoutes import router as user_router
from backend.api.ReviewRoutes import router as reviews_router
from backend.api.JobAlertsRoutes import router as job_alerts_router
from backend.api.CourseNotificationRoutes import router as course_notifications_router
from backend.database.db import db, db_client

app = FastAPI()
# Allow the dev frontend on both `localhost` and `127.0.0.1` (browsers treat
# them as distinct origins) and any local port via regex so the team can switch
# Next.js dev ports without re-editing CORS. allow_origins is explicit for the
# common ports; the regex covers everything else loopback-local.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://main.d3r8wpimm7ocxp.amplifyapp.com",
    ],
    allow_origin_regex=r"https://.*\.amplifyapp\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if getattr(db, "mode", "local") == "local":
    _storage_dir = Path(__file__).resolve().parent.parent / "data" / "storage"
    _storage_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/static/storage", StaticFiles(directory=str(_storage_dir)), name="local-storage")

resume_service = ResumeService(db_client)

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(upload_router)
app.include_router(company_router)
app.include_router(company_jobs_router)
app.include_router(user_jobs_router)
app.include_router(applications_router)
app.include_router(cover_letters_router)
app.include_router(dashboard_router)
app.include_router(templates_router)
app.include_router(ai_router)
app.include_router(skill_matrix_router)
app.include_router(payments_router)
app.include_router(contact_router)
app.include_router(user_router)
app.include_router(reviews_router)
app.include_router(job_alerts_router)
app.include_router(course_notifications_router)


@app.get("/")
def root():
    return {"message": "Hello World from FastAPI!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/test-claim-resume")
async def test_claim_resume(resume_id: str, user_id: str):
    result = resume_service.claim_resume(resume_id, user_id)
    return result