from fastapi import APIRouter, HTTPException
from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.AIService import AIService
from backend.services.ResumeService import ResumeService
from backend.database.db import db

router = APIRouter(prefix="/resume", tags=["resume"])
resume_service = ResumeService(db.get_db())

@router.post("/generate", summary="Generate a resume")
async def generate_resume(data: ResumeCreate, tier: str = "pro"):
    resume_dict = data.model_dump(mode='json')

    resume_obj = data.to_model()
    new_resume = resume_service.save_raw_resume(resume_obj)
    try:
        new_resume = resume_service.save_raw_resume(resume_obj)

        polished_result = AIService.run_cv_pipeline(resume_dict, tier)

        resume_service.update_polished_content(new_resume['id'], polished_result)

        return {
            "status": "success",
            "polished_resume": polished_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.templating import Jinja2Templates
from fastapi import Request
templates = Jinja2Templates(directory="templates")

@router.get("/view-resume/{resume_id}")
async def view_resume(request: Request, resume_id: str):
    resume_data = resume_service.get_resume(resume_id)

    return templates.TemplateResponse(
        "resume_template.html",
        {"request": request, "data": resume_data}
    )

print("Registered routes:", router.routes)