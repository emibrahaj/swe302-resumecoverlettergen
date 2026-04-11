import json
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException

from backend.database.db import db, db_client
from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.AIService import AIService
from backend.services.ResumeService import ResumeService

router = APIRouter(prefix="/resume", tags=["resume"])
resume_service = ResumeService(db.get_db())


@router.post("/generate", summary="Generate a resume")
async def generate_resume(data: ResumeCreate, tier: str = "pro"):
    resume_payload = json.loads(data.model_dump_json())
    clean_payload = AIService.prepare_ai_payload(resume_payload)
    resume_obj = data.to_model()

    try:
        saved_resume = resume_service.save_raw_resume(resume_obj)
        resume_id = getattr(saved_resume, "id", None) or (
            saved_resume.get("id") if isinstance(saved_resume, dict) else None)

        if not resume_id:
            raise RuntimeError("Resume ID is missing after saving.")

        if saved_resume is None:
            raise RuntimeError("Failed to save resume before generation.")

        timecheck = (datetime.now() - timedelta(days=10)).isoformat()
        cache_query = db_client.table("market_insights_cache").select("*").eq("job_title", data.target_job_title).gte(
            "last_updated", timecheck).single().execute()

        cached_market_info = cache_query.data

        if cached_market_info:
            print("Cache hit. Using recently stored insights for ", data.target_job_title)
            polished_result = AIService.run_writer_agent(clean_payload, cached_market_info["raw_scraps"])
        else:
            # the normal AI pipeline
            polished_result = AIService.run_cv_pipeline(clean_payload, tier)

        if hasattr(polished_result, "json_dict") and polished_result.json_dict:
            final_content = polished_result.json_dict

        elif hasattr(polished_result, "raw"):
            final_content = polished_result.raw
        else:
            final_content = str(polished_result)

        final_polished_content = AIService.merge_polished_data(resume_payload, final_content)

        update_response = db_client.table("resumes").update({
            "polished_content": final_polished_content,
            "premium_analysis": tier == "pro"
        }).eq("id", str(resume_id)).execute()

        if not update_response.data:
            raise RuntimeError(f"No resume found with ID {resume_id} to update.")

        extracted_skills = []
        if isinstance(final_content, dict):
            extracted_skills = (
                    final_content.get("skills", []) or final_content.get("top_skills", []) or final_content.get(
                "key_competencies", []))
        elif isinstance(final_content, str):
            pass

        cache_data = {"job_title": data.target_job_title, "company_name": "General Market",
            "search_query": f"market_trends_{data.target_job_title.lower().replace(' ', '_')}",
            "key_skills": extracted_skills, "raw_scraps": final_content}

        db_client.table("market_insights_cache").upsert(cache_data, on_conflict="search_query").execute()
        return {
            "resume_id": resume_id,
            "status": "completed",
            "polished_content": final_polished_content
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


from fastapi.templating import Jinja2Templates
from fastapi import Request

templates = Jinja2Templates(directory="templates")


@router.get("/view-resume/{resume_id}")
async def view_resume(request: Request, resume_id: str):
    resume_data = resume_service.get_resume(resume_id)

    return templates.TemplateResponse("resume_template.html", {"request": request, "data": resume_data})


print("Registered routes:", router.routes)
