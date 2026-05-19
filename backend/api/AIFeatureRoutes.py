from typing import Any, Dict, List

from crewai import Crew, Task
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.AIFeatureSchema import CourseUsageRequest, MarketStandardsRequest, ResumeSkillGapRequest
from backend.services.AgentService import AgentService
from backend.services.AIDataService import AIDataService
from backend.services.AnalysisService import AnalysisService

# Fields the AI outputs as part of its schema but that don't belong in polished resume content.
_POLISHED_STRIP_KEYS = {"user_id", "template_id"}


def _post_pipeline_analysis(
    db_client: Client,
    resume_id: str,
    user_id: str,
    resume: dict,
    polished: dict,
) -> None:
    """Populate ai_market_insights, ai_learning_recommendations, last_analysis_id, and
    market_insights_cache after the agent pipeline saves polished_content."""
    job_title = (
        resume.get("target_job_title")
        or (resume.get("raw_content") or {}).get("target_job_title")
        or ""
    )

    market_skills: List[str] = []
    market_record: Dict[str, Any] | None = None

    if job_title:
        cached = (
            db_client.table("market_insights_cache")
            .select("*")
            .eq("job_title", job_title.strip())
            .limit(1)
            .execute()
        )
        if cached.data:
            market_record = cached.data[0]
            raw_skills = market_record.get("key_skills") or []
            market_skills = [str(s) for s in raw_skills if s] if isinstance(raw_skills, list) else []

    user_skills = AIDataService.extract_skill_names(polished)
    analysis = AnalysisService.calculate_skill_gap(user_skills, market_skills)
    courses = AnalysisService.get_course_recommendations(analysis["missing_skills"], db_client)

    if job_title:
        saved = AIDataService.save_market_insights(
            db_client=db_client,
            job_title=job_title,
            key_skills=market_skills or user_skills,
            raw_scraps=market_record or {"source": "agent_pipeline"},
        )
        market_record = market_record or saved

    AIDataService.update_resume_ai_fields(
        db_client=db_client,
        resume_id=resume_id,
        market_insights=market_record or {},
        learning_recommendations=courses,
    )

    if user_id:
        AIDataService.save_resume_feedback(
            db_client=db_client,
            user_id=user_id,
            resume_id=resume_id,
            analysis=analysis,
            courses=courses,
        )

router = APIRouter(prefix="/ai", tags=["AI Features"])


def _ensure_dict(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value
    if hasattr(value, "json_dict") and value.json_dict:
        return value.json_dict
    if hasattr(value, "raw"):
        value = value.raw
    return {"raw_text": str(value)}


def _get_resume_for_user(db_client: Client, resume_id: str, user_id: str) -> dict:
    res = (
        db_client.table("resumes")
        .select("*")
        .eq("id", str(resume_id))
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found for this user")
    return res.data


@router.post("/market-standards")
async def research_market_standards(
    data: MarketStandardsRequest,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Run/save the web researcher output for resume/job standards."""
    cached = (
        db_client.table("market_insights_cache")
        .select("*")
        .eq("search_query", f"market_trends_{data.job_title.lower().strip().replace(' ', '_')}")
        .maybe_single()
        .execute()
    )
    if cached.data:
        return {"status": "cached", "market_insights": cached.data}

    researcher = AgentService.get_researcher()
    if researcher is None:
        raise HTTPException(status_code=500, detail="Researcher agent could not be initialized")

    task = Task(
        description=(
            f"Research current resume and hiring standards for the role '{data.job_title}'. "
            "Return the most important hard skills, soft skills, certifications, ATS keywords, "
            "and 3 practical resume improvement tips."
        ),
        expected_output="Structured JSON-like summary with key_skills, certifications, ATS keywords, and resume tips.",
        agent=researcher,
    )
    result = Crew(agents=[researcher], tasks=[task], verbose=True).kickoff()
    result_dict = _ensure_dict(result)
    key_skills = AIDataService.extract_market_skills(result_dict)

    saved = AIDataService.save_market_insights(
        db_client=db_client,
        job_title=data.job_title,
        company_name=data.company_name,
        key_skills=key_skills,
        raw_scraps=result_dict,
    )
    return {"status": "saved", "market_insights": saved}


@router.post("/resume/{resume_id}/skill-gap")
async def analyze_resume_skill_gap(
    resume_id: str,
    data: ResumeSkillGapRequest | None = None,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Analyze a resume, save resume_feedback/history/job_analysis, and update the resume row."""
    user_id = get_user_id(current_user)
    resume = _get_resume_for_user(db_client, resume_id, user_id)
    content = resume.get("polished_content") or resume.get("raw_content") or {}
    job_title = resume.get("target_job_title") or content.get("target_job_title") or "General Resume"

    request_data = data or ResumeSkillGapRequest()
    market_skills: List[str] = request_data.market_skills or []
    market_insights: Dict[str, Any] = request_data.market_insights or {}

    if not market_skills:
        cached = (
            db_client.table("market_insights_cache")
            .select("*")
            .eq("search_query", f"market_trends_{job_title.lower().strip().replace(' ', '_')}")
            .maybe_single()
            .execute()
        )
        if cached.data:
            market_insights = cached.data
            market_skills = cached.data.get("key_skills") or []

    user_skills = AIDataService.extract_skill_names(content)
    analysis = AnalysisService.calculate_skill_gap(user_skills, market_skills)
    courses = AnalysisService.get_course_recommendations(analysis["missing_skills"], db_client)

    market_record = AIDataService.save_market_insights(
        db_client=db_client,
        job_title=job_title,
        key_skills=market_skills,
        raw_scraps=market_insights or {"source": "manual_skill_gap_input"},
    )
    feedback = AIDataService.save_resume_feedback(db_client, user_id, resume_id, analysis, courses)
    history = AIDataService.save_user_analysis_history(db_client, user_id, resume_id, analysis, courses)
    job_analysis = AIDataService.save_job_analysis_bundle(db_client, user_id, resume_id, analysis, market_record or {})
    AIDataService.update_resume_ai_fields(
        db_client=db_client,
        resume_id=resume_id,
        market_insights=market_record,
        learning_recommendations=courses,
        last_analysis_id=feedback.get("id") if feedback else None,
    )

    return {
        "resume_id": resume_id,
        "analysis": {
            **analysis,
            "feedback_id": feedback.get("id") if feedback else None,
            "history_id": history.get("id") if history else None,
            "job_analysis_id": job_analysis.get("id") if job_analysis else None,
        },
        "courses": courses,
    }


@router.post("/resume/{resume_id}/course-recommendations")
async def recommend_courses_for_resume(
    resume_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Read latest saved gaps and save resume-level course recommendations."""
    user_id = get_user_id(current_user)
    _get_resume_for_user(db_client, resume_id, user_id)

    feedback_res = (
        db_client.table("resume_feedback")
        .select("skill_gaps, learning_path")
        .eq("resume_id", resume_id)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    missing_skills = []
    if feedback_res.data:
        missing_skills = feedback_res.data[0].get("skill_gaps") or []

    courses = AnalysisService.get_course_recommendations(missing_skills, db_client)
    AIDataService.update_resume_ai_fields(db_client, resume_id, learning_recommendations=courses)
    return {"resume_id": resume_id, "missing_skills": missing_skills, "courses": courses}


@router.post("/courses/usage")
async def save_course_usage(
    data: CourseUsageRequest,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Save course_usage when a user clicks/uses recommended courses."""
    user_id = get_user_id(current_user)
    rows = AIDataService.save_course_usage(db_client, user_id, [str(course_id) for course_id in data.course_ids])
    return {"status": "saved", "rows": rows}


@router.post("/expand-bullet")
async def expand_bullet(
    data: Dict[str, str],
    current_user=Depends(get_current_user),
):
    """Expand a short phrase into a STAR-method resume bullet via the Bullet Point Agent."""
    from backend.services.AIService import AIService as _AIService
    phrase = (data.get("phrase") or "").strip()
    if not phrase:
        raise HTTPException(status_code=400, detail="phrase is required")
    bullet = _AIService.expand_work_bullet(phrase)
    return {"bullet": bullet}


@router.post("/agents/run-pipeline")
async def run_agent_pipeline(
    data: Dict[str, Any],
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    """Run the 4-agent template-fitting pipeline on a resume the caller owns.

    Body: {resume_id: str, template_id?: str, tier?: 'free'|'pro'}
    The resulting polished_content is persisted to resumes.polished_content.
    """
    from backend.services.AIService import AIService as _AIService

    user_id = get_user_id(current_user)
    resume_id = data.get("resume_id")
    if not resume_id:
        raise HTTPException(status_code=400, detail="resume_id is required")

    resume = _get_resume_for_user(db_client, str(resume_id), user_id)
    raw_content = resume.get("raw_content") or {}
    if not raw_content:
        raise HTTPException(status_code=409, detail="Resume has no raw content to polish")

    # Allow caller to override template; default to whatever's stored
    template_id = data.get("template_id")
    if template_id is None:
        design = raw_content.get("_design") or {}
        template_id = design.get("template_id") or resume.get("template_id")
    tier = (data.get("tier") or "free").lower()

    try:
        result = _AIService.run_template_aware_pipeline(raw_content, template_id=template_id, tier=tier)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Agent pipeline failed: {exc}") from exc

    polished = result.get("polished_content") or {}
    # Strip schema-only fields the AI injects that don't belong in resume content.
    polished = {k: v for k, v in polished.items() if k not in _POLISHED_STRIP_KEYS}
    # Always carry over the user's _design choices (template, accent colour, fonts).
    # The AI pipeline output never includes _design, so without this the dashboard
    # loses track of which template was selected and silently falls back to template7.
    raw_design = (raw_content.get("_design") or {}).copy()
    if raw_design:
        polished.setdefault("_design", {})
        for k, v in raw_design.items():
            polished["_design"].setdefault(k, v)
    if polished:
        db_client.table("resumes").update({
            "polished_content": polished,
            "premium_analysis": tier == "pro",
        }).eq("id", str(resume_id)).execute()

        # Populate ai_market_insights, ai_learning_recommendations, last_analysis_id,
        # and market_insights_cache — the pipeline skips these by design, so we backfill them.
        try:
            _post_pipeline_analysis(db_client, str(resume_id), user_id, resume, polished)
        except Exception as exc:
            print(f"[run_agent_pipeline] post-analysis failed (non-fatal): {exc}")

    return {
        "resume_id": str(resume_id),
        "polished_content": polished,
        "template_spec": result.get("template_spec"),
        "stages": result.get("stages") or [],
        "status": "completed",
    }
