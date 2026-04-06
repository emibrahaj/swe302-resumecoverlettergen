from fastapi import APIRouter, HTTPException, Depends

from backend.models.Resume import Education, Resume, Experience, Skill, Language, Project, Certification, Training
from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.ResumeService import ResumeService
from sqlalchemy.orm import Session
from backend.database.db import db

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/generate", summary="Generate a resume")
async def generate_resume(data: ResumeCreate, db: Session = Depends(db.get_db)):
    resume_obj = data.to_model()
    try:
        resume_service = ResumeService(db)
        new_resume = resume_service.save_raw_resume(resume_obj)
        #ai
        return {
            "status": "success",
            "message": "Resume generated successfully. AI polishing started",
            "resume_id": new_resume['id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

print("Registered routes:", router.routes)