from uuid import UUID

from supabase import Client

from backend.database.db import db, db_client
from backend.auth.auth_handler import get_current_user, get_user_id
from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.PDFService import PDFService
from backend.services.TemplateService import TemplateService
from backend.services.AIService import AIService
from backend.services.AnalysisService import AnalysisService
from backend.services.AIDataService import AIDataService
from backend.services.ResumeService import ResumeService

import json, os, tempfile
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse, HTMLResponse

router = APIRouter(prefix="/resume", tags=["resume"])
resume_service = ResumeService(db.get_db())

@router.get("/my-resumes")
async def get_resumes(current_user=Depends(get_current_user)):
    return resume_service.list_user_resumes(get_user_id(current_user))

@router.get("/my-resumes/{resume_id}")
async def get_resume(resume_id: str):
    resume = resume_service.get_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.post("/submit-info")
async def submit_info(data: ResumeCreate):
    try:
        saved_resume = resume_service.save_raw_resume(data)
        resume_id = saved_resume["id"]

        return {
            "status": "success",
            "resume_id": resume_id,
            "message": "Resume saved successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/{resume_id}/generate")
async def generate_existing_resume(
    resume_id: UUID,
    tier: str = "pro",
    db_client: Client = Depends(db.get_db),
):
    existing = (
        db_client.table("resumes")
        .select("*")
        .eq("id", str(resume_id))
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume = existing.data
    resume_payload = resume.get("raw_content") or {}

    clean_payload = AIService.prepare_ai_payload(resume_payload)
    target_job_title = resume.get("target_job_title") or resume_payload.get("target_job_title")

    market_info = get_cached_market_info(target_job_title)

    if market_info:
        raw_result = AIService.run_writer_agent(clean_payload, market_info["raw_scraps"])
    else:
        raw_result = AIService.run_cv_pipeline(clean_payload, tier)

        if hasattr(raw_result, "tasks_output") and len(raw_result.tasks_output) > 0:
            save_market_info_to_cache(
                job_title=target_job_title,
                key_skills=raw_result.tasks_output[0].raw,
                raw_scraps={"research_output": raw_result.tasks_output[0].raw}
            )

    ai_dict = ensure_dict(raw_result if hasattr(raw_result, "raw") else raw_result)
    final_polished_content = AIService.merge_polished_data(resume_payload, ai_dict)

    update_resume_in_db(str(resume_id), final_polished_content, tier)

    analysis, courses = process_skill_analysis(
        resume.get("user_id"),
        str(resume_id),
        final_polished_content,
        ai_dict,
        target_job_title,
    )

    return {
        "resume_id": str(resume_id),
        "status": "completed",
        "analysis": analysis,
        "courses": courses,
        "polished_content": final_polished_content,
    }

@router.get("/my-resumes/{resume_id}/preview")
async def preview_resume(resume_id: str):
    try:
        result = db_client.table("resumes").select("polished_content, template_id").eq("id", resume_id).single().execute()

        if not result.data or not result.data.get("polished_content"):
            raise HTTPException(status_code=404, detail="Resume not found")

        html_content = TemplateService.render_resume(
            db_client=db_client,
            content_dict=result.data["polished_content"],
            template_id=result.data.get("template_id")
        )
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        print(f"Error in preview_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/my-resumes/{resume_id}/download")
async def download_resume(resume_id: str, background_tasks: BackgroundTasks):
    res = db_client.table("resumes").select("polished_content").eq("id", resume_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    html_content = TemplateService.render_resume(db_client=db_client, content_dict=res.data["polished_content"])

    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        await PDFService.generate_pdf(html_content, temp_path)
        background_tasks.add_task(remove_file, temp_path)
        return FileResponse(
            path=temp_path,
            media_type="application/pdf",
            filename=f"resume_{resume_id}.pdf"
        )
    finally:
        os.close(fd)

@router.delete("/my-resumes/{resume_id}")
async def delete_resume(resume_id: str):
    return resume_service.delete_resume(resume_id)


def save_market_info_to_cache(job_title: str, key_skills, raw_scraps=None):
    """Stores AI research into the database to avoid redundant API calls."""
    try:
        AIDataService.save_market_insights(
            db_client=db_client,
            job_title=job_title,
            key_skills=key_skills,
            raw_scraps=raw_scraps or {"source": "resume_generation"},
        )
        print(f"Market insights cached for: {job_title}")
    except Exception as e:
        print(f"Failed to cache market info: {e}")


@router.post("/generate", summary="Generate a resume")
async def generate_resume(data: ResumeCreate, tier: str = "pro"):
    resume_payload = data.model_dump(mode="json")
    clean_payload = AIService.prepare_ai_payload(resume_payload)

    try:
        saved_resume = resume_service.save_raw_resume(data)
        resume_id = str(getattr(saved_resume, "id", None) or saved_resume.get("id"))

        market_info = get_cached_market_info(data.target_job_title)

        if market_info:
            print(f"Cache Hit: {data.target_job_title}")
            raw_result = AIService.run_writer_agent(clean_payload, market_info["raw_scraps"])
        else:
            print(f"Cache Miss: Running full pipeline for {data.target_job_title}")
            raw_result = AIService.run_cv_pipeline(clean_payload, tier)

            if hasattr(raw_result, 'tasks_output') and len(raw_result.tasks_output) > 0:
                save_market_info_to_cache(
                    job_title=data.target_job_title,
                    key_skills=raw_result.tasks_output[0].raw,
                    raw_scraps={"research_output": raw_result.tasks_output[0].raw}
                )

        ai_dict = ensure_dict(raw_result if hasattr(raw_result, 'raw') else raw_result)
        final_polished_content = AIService.merge_polished_data(resume_payload, ai_dict)
        update_resume_in_db(resume_id, final_polished_content, tier)

        analysis, courses = process_skill_analysis(
            data.user_id,
            resume_id,
            final_polished_content,
            ai_dict,
            data.target_job_title
        )

        return {
            "resume_id": resume_id,
            "status": "completed",
            "is_guest": data.user_id is None,
            "analysis": analysis,
            "courses": courses,
            "polished_content": final_polished_content
        }

    except Exception as exc:
        print(f"Error in generate_resume: {str(exc)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(exc)}")

@router.patch("/my-resumes/{resume_id}/edit")
async def save_manual_edits(resume_id: str, edited_data: dict):
    """ Save changes button on editor page"""
    result = resume_service.update_manual_edits(resume_id, edited_data)
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to save edits")
    return {"status": "success", "message": "Edits saved successfully"}

def ensure_dict(ai_output) -> dict:
    """Safely converts AI output (TaskOutput, str, or dict) into a dictionary."""
    # If it's a CrewAI TaskOutput object
    if hasattr(ai_output, "json_dict") and ai_output.json_dict:
        return ai_output.json_dict
    if hasattr(ai_output, "raw"):
        ai_output = ai_output.raw

    if isinstance(ai_output, str):
        try:
            clean_str = ai_output.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_str)
        except Exception as e:
            return {"raw_text": ai_output, "skills": [], "message": e}  # Fallback

    return ai_output if isinstance(ai_output, dict) else {}

def get_cached_market_info(job_title: str):
    """Checks for fresh market insights in the last 10 days."""
    timecheck = (datetime.now() - timedelta(days=10)).isoformat()
    query = db_client.table("market_insights_cache") \
        .select("*") \
        .eq("job_title", job_title) \
        .gte("last_updated", timecheck) \
        .execute()
    return query.data[0] if query.data else None

def update_resume_in_db(resume_id, content, tier):
    """Updates the polished_content in the database."""
    res = db_client.table("resumes").update({
        "polished_content": content,
        "premium_analysis": tier == "pro"
    }).eq("id", resume_id).execute()
    if not res.data:
        raise RuntimeError(f"Update failed for resume {resume_id}")

def process_skill_analysis(user_id, resume_id, polished_content, ai_dict, job_title):
    """Analyze skills and persist every AI output that belongs in the database."""
    ai_dict = ai_dict if isinstance(ai_dict, dict) else ensure_dict(ai_dict)

    user_skills = AIDataService.extract_skill_names(polished_content)
    market_skills = AIDataService.extract_market_skills(ai_dict)

    # If the AI writer returns only polished resume JSON and no market skills,
    # keep the analysis safe instead of crashing.
    analysis = AnalysisService.calculate_skill_gap(user_skills, market_skills)
    courses = AnalysisService.get_course_recommendations(analysis["missing_skills"], db_client)

    market_record = AIDataService.save_market_insights(
        db_client=db_client,
        job_title=job_title or "General Resume",
        key_skills=market_skills,
        raw_scraps=ai_dict,
    )

    AIDataService.update_resume_ai_fields(
        db_client=db_client,
        resume_id=resume_id,
        market_insights=market_record or ai_dict,
        learning_recommendations=courses,
    )

    feedback = AIDataService.save_resume_feedback(
        db_client=db_client,
        user_id=user_id,
        resume_id=resume_id,
        analysis=analysis,
        courses=courses,
    )

    history = AIDataService.save_user_analysis_history(
        db_client=db_client,
        user_id=user_id,
        resume_id=resume_id,
        analysis=analysis,
        courses=courses,
    )

    job_analysis = AIDataService.save_job_analysis_bundle(
        db_client=db_client,
        user_id=user_id,
        resume_id=resume_id,
        analysis=analysis,
        market_insights=market_record or ai_dict,
    )

    return {
        **analysis,
        "feedback_id": feedback.get("id") if feedback else None,
        "history_id": history.get("id") if history else None,
        "job_analysis_id": job_analysis.get("id") if job_analysis else None,
    }, courses

def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)