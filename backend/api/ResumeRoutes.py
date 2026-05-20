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
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request
from fastapi.responses import FileResponse, HTMLResponse

router = APIRouter(prefix="/resume", tags=["resume"])
resume_service = ResumeService(db.get_db())

@router.get("/my-resumes")
async def get_resumes(current_user=Depends(get_current_user)):
    return resume_service.list_user_resumes(get_user_id(current_user))

@router.get("/my-resumes/{resume_id}")
async def get_resume(resume_id: str, current_user=Depends(get_current_user)):
    resume = resume_service.get_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.get("user_id") and resume["user_id"] != get_user_id(current_user):
        raise HTTPException(status_code=403, detail="Not your resume")
    return resume


def _resolve_template_uuid(template_id: str | None) -> str | None:
    """The frontend passes numeric IDs ("1".."14"); the DB stores templates as UUIDs.
    Look up the matching templates row by style_config.file = template_{N}.html.
    Returns the canonical UUID, or None if it can't be resolved (so the FK column stays NULL)."""
    if not template_id:
        return None
    s = str(template_id).strip()
    # Already a UUID?
    if len(s) >= 32 and "-" in s:
        return s
    try:
        n = int(s)
    except (TypeError, ValueError):
        return None
    if not (1 <= n <= 14):
        return None
    expected_file = f"template_{n}.html"
    res = db_client.table("templates").select("id, style_config").execute()
    for row in res.data or []:
        cfg = row.get("style_config") or {}
        if isinstance(cfg, dict) and cfg.get("file") == expected_file:
            return row["id"]
    return None


# Numeric IDs that are Pro-only (mirrors frontend templates.config.ts: 4, 6, 8, 10).
# Canonical lookup also covers DB rows where templates.is_premium = true.
_PREMIUM_NUMERIC_IDS = {"4", "6", "8", "10"}


def _is_premium_template(template_id: str | None) -> bool:
    if not template_id:
        return False
    s = str(template_id).strip()
    if s in _PREMIUM_NUMERIC_IDS:
        return True
    # If it's a UUID, check the templates table.
    if len(s) >= 32:
        try:
            row = db_client.table("templates").select("is_premium").eq("id", s).single().execute()
            return bool(row.data and row.data.get("is_premium"))
        except Exception:
            return False
    return False


def _user_is_pro(user_id: str) -> bool:
    try:
        row = db_client.table("user_profiles").select("tier").eq("id", user_id).single().execute()
        return bool(row.data and (row.data.get("tier") or "").lower() == "pro")
    except Exception:
        return False


def _enforce_template_tier(template_id: str | None, user_id: str) -> None:
    """Raise 402 if the user picked a Pro template but isn't on the Pro tier."""
    if template_id is None:
        return
    if not _is_premium_template(template_id):
        return
    if _user_is_pro(user_id):
        return
    raise HTTPException(
        status_code=402,
        detail="This template is Pro-only. Upgrade your plan to use it.",
    )


@router.post("/save")
async def save_resume(
    payload: dict,
    current_user=Depends(get_current_user),
):
    """Upsert a resume from the CVBuilder. Body: {resume_id?, raw_content, target_job_title?, template_id?}."""
    user_id = get_user_id(current_user)
    raw_content = payload.get("raw_content") or {}
    target_job_title = payload.get("target_job_title") or raw_content.get("target_job_title") or ""
    raw_template_id = payload.get("template_id")
    _enforce_template_tier(raw_template_id, user_id)
    template_uuid = _resolve_template_uuid(raw_template_id)
    resume_id = payload.get("resume_id")

    record = {
        "user_id": user_id,
        "raw_content": raw_content,
        "target_job_title": target_job_title,
    }
    if template_uuid is not None:
        record["template_id"] = template_uuid
    # Stash the original numeric id so the frontend roundtrips its design choice
    if raw_template_id is not None and isinstance(raw_content, dict):
        raw_content.setdefault("_design", {})["template_id"] = str(raw_template_id)
        record["raw_content"] = raw_content

    if resume_id:
        existing = resume_service.get_resume(resume_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Resume not found")
        if existing.get("user_id") and existing["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your resume")
        res = db_client.table("resumes").update(record).eq("id", str(resume_id)).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update resume")
        return {"status": "success", "resume_id": str(resume_id), "resume": res.data[0]}

    res = db_client.table("resumes").insert(record).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create resume")
    return {"status": "success", "resume_id": res.data[0]["id"], "resume": res.data[0]}

@router.post("/submit-info")
async def submit_info(data: ResumeCreate, current_user=Depends(get_current_user)):
    try:
        # Force the resume's user_id to the authenticated user (don't trust body)
        data.user_id = get_user_id(current_user)
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
    current_user=Depends(get_current_user),
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

    if existing.data.get("user_id") and existing.data["user_id"] != get_user_id(current_user):
        raise HTTPException(status_code=403, detail="Not your resume")

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

def _render_resume_html(resume_id: str, user_id: str) -> tuple[str, dict]:
    """Load a resume the caller owns and render it to HTML using the chosen template.

    Falls back to raw_content if polished_content is not populated yet, so the
    download/preview works even before AI polishing has run.
    """
    result = (
        db_client.table("resumes")
        .select("*")
        .eq("id", resume_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    if result.data.get("user_id") and result.data["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your resume")

    content = result.data.get("polished_content") or result.data.get("raw_content") or {}
    if not content:
        raise HTTPException(status_code=409, detail="Resume has no content yet")

    html = TemplateService.render_resume(
        db_client=db_client,
        content_dict=content,
        template_id=result.data.get("template_id"),
    )
    return html, result.data


@router.get("/my-resumes/{resume_id}/preview")
async def preview_resume(resume_id: str, current_user=Depends(get_current_user)):
    html_content, _ = _render_resume_html(resume_id, get_user_id(current_user))
    return HTMLResponse(content=html_content, status_code=200)


@router.get("/my-resumes/{resume_id}/download")
async def download_resume(
    resume_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    """Generate a PDF that matches the user's live React preview exactly.

    Strategy: launch Playwright headless against the frontend's /preview-public/{id}
    page (which renders the same <ResumePreview> component the user sees while
    editing). Falls back to the Jinja2 server-side renderer if the frontend isn't
    reachable.

    The preview page reads raw_content (which the editor saves immediately before
    calling this endpoint), so the PDF reflects exactly what the user sees on
    screen — including any AI Enhance or per-bullet expansions they accepted.
    """
    user_id = get_user_id(current_user)
    # Ownership check (the preview page also re-verifies via the user's token)
    existing = resume_service.get_resume(resume_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Resume not found")
    if existing.get("user_id") and existing["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your resume")

    # Extract the bearer token the user just authenticated with so the frontend
    # preview page can call the same backend to fetch the resume.
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else ""
    frontend_base = os.environ.get("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")
    preview_url = f"{frontend_base}/preview-public/{resume_id}?token={token}"

    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)  # Release Windows file lock so Playwright/Chromium can write to this path
    used_fallback = False
    try:
        try:
            await PDFService.generate_pdf_from_url(preview_url, temp_path)
        except Exception as exc:
            # If the frontend isn't reachable (e.g. dev server down), fall back
            # to rendering the Jinja2 server-side template.
            print(f"[PDF] preview-page render failed ({exc!r}); falling back to Jinja2.")
            used_fallback = True
            html_content, _ = _render_resume_html(resume_id, user_id)
            await PDFService.generate_pdf(html_content, temp_path)

        background_tasks.add_task(remove_file, temp_path)
        return FileResponse(
            path=temp_path,
            media_type="application/pdf",
            filename=f"resume_{resume_id}.pdf",
            headers={"X-PDF-Renderer": "jinja2-fallback" if used_fallback else "react-preview"},
        )
    except Exception:
        remove_file(temp_path)
        raise


@router.delete("/my-resumes/{resume_id}")
async def delete_resume(resume_id: str, current_user=Depends(get_current_user)):
    user_id = get_user_id(current_user)
    existing = resume_service.get_resume(resume_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Resume not found")
    if existing.get("user_id") and existing["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your resume")
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
async def generate_resume(data: ResumeCreate, tier: str = "pro", current_user=Depends(get_current_user)):
    data.user_id = get_user_id(current_user)
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
async def save_manual_edits(
    resume_id: str,
    edited_data: dict,
    current_user=Depends(get_current_user),
):
    """ Save changes button on editor page"""
    user_id = get_user_id(current_user)
    existing = resume_service.get_resume(resume_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Resume not found")
    if existing.get("user_id") and existing["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your resume")
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
        # the ai enhance button should also polish the "professional summary" section