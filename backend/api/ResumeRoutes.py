from backend.database.db import db, db_client
from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.PDFService import PDFService
from backend.services.TemplateService import TemplateService
from backend.services.AIService import AIService
from backend.services.AnalysisService import AnalysisService
from backend.services.ResumeService import ResumeService

import json, os, tempfile
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, HTMLResponse

router = APIRouter(prefix="/resume", tags=["resume"])
resume_service = ResumeService(db.get_db())

@router.post("/generate", summary="Generate a resume")
async def generate_resume(data: ResumeCreate, tier: str = "pro"):
    # 1. Prep Data
    resume_payload = data.model_dump(mode="json")
    clean_payload = AIService.prepare_ai_payload(resume_payload)

    try:
        # 2. Initial Save
        saved_resume = resume_service.save_raw_resume(data.to_model())
        resume_id = str(getattr(saved_resume, "id", None) or saved_resume.get("id"))

        # 3. Handle Market Insights
        market_info = get_cached_market_info(data.target_job_title)

        if market_info:
            print(f"Cache Hit: {data.target_job_title}")
            polished_result = AIService.run_writer_agent(clean_payload, market_info["raw_scraps"])
        else:
            print(f"Cache Miss: Running full pipeline for {data.target_job_title}")
            polished_result = AIService.run_cv_pipeline(clean_payload, tier)

        # 4. Clean & Parse AI Output (The Fix for your 'str' error)
        ai_dict = ensure_dict(polished_result)

        # 5. Merge AI Text with Original UUIDs
        final_polished_content = AIService.merge_polished_data(resume_payload, ai_dict)

        # 6. Update Database & Cache Insights
        update_resume_in_db(resume_id, final_polished_content, tier)

        # 7. Skill Gap & Recommendations
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
            "analysis": analysis,
            "courses": courses,
            "polished_content": final_polished_content
        }

    except Exception as exc:
        print(f"Error in generate_resume: {str(exc)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(exc)}")

@router.get("/{resume_id}/preview")
async def preview_resume(resume_id: str):
    try:
        result = db_client.table("resumes").select("polished_content").eq("id", resume_id).single().execute()
        if not result.data or not result.data.get("polished_content"):
            raise HTTPException(status_code=404, detail="Resume not found")
        html_content = TemplateService.render_resume(result.data["polished_content"])
        polished_data = result.data["polished_content"]
        html_content = TemplateService.render_resume(polished_data)
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        print(f"Error in preview_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/{resume_id}/download")
async def download_resume(resume_id: str, background_tasks: BackgroundTasks):
    res = db_client.table("resumes").select("polished_content").eq("id", resume_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    html_content = TemplateService.render_resume(res.data["polished_content"])

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
        except:
            return {"raw_text": ai_output, "skills": []}  # Fallback

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
    # Extract skills safely
    user_skills = [s['skill_name'] for s in polished_content.get('skills', [])]
    market_skills = ai_dict.get("skills", []) or ai_dict.get("top_skills", [])

    # Flatten market_skills if they are dicts
    if market_skills and isinstance(market_skills[0], dict):
        market_skills = [s.get("skill_name") for s in market_skills]

    # Analysis
    analysis = AnalysisService.calculate_skill_gap(user_skills, market_skills)
    courses = AnalysisService.get_course_recommendations(analysis["missing_skills"], db_client)

    # Log to History
    history_record = {
        "user_id": user_id,
        "resume_id": resume_id,
        "match_score": int(analysis["match_score"]),
        "skill_gap_analysis": {"missing": analysis["missing_skills"], "courses": courses}
    }
    db_client.table("user_analysis_history").insert(history_record).execute()

    # Update Cache (Upsert)
    cache_data = {
        "job_title": job_title,
        "search_query": f"market_trends_{job_title.lower().replace(' ', '_')}",
        "key_skills": market_skills,
        "raw_scraps": ai_dict
    }
    db_client.table("market_insights_cache").upsert(cache_data, on_conflict="search_query").execute()

    return analysis, courses

def remove_file(path: str):
    if os.path.exists(path):
        os.remove(path)

print("Registered routes:", router.routes)
