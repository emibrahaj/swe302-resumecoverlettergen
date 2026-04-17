from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.services.ResumeService import ResumeService
from backend.api.AuthRoutes import router as auth_router
from backend.api.ResumeRoutes import router as resume_router
from backend.api.UploadRoutes import router as upload_router
from backend.api.CompanyRoutes import router as company_router
from backend.database.db import db_client

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"],
    allow_headers=["*"]
)

resume_service = ResumeService(db_client)

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(upload_router)
app.include_router(company_router)
@ app.get("/")
def root():
    return {"message": "Hello World from FastAPI!"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/test-claim-resume")
async def test_claim_resume(resume_id: str, user_id: str):
    result = resume_service.claim_resume(resume_id, user_id)
    return result
