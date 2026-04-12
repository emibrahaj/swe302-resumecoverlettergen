from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.api.AuthRoutes import router as auth_router
from backend.api.ResumeRoutes import router as resume_router
from backend.api.UploadRoutes import router as upload_router
from backend.api.CompanyRoutes import router as company_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"],
    allow_headers=["*"]
)

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
