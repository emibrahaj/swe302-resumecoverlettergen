import json
from typing import Any
from uuid import UUID

from crewai import Crew, Task
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.AIFeatureSchema import (
    CoverLetterGenerateRequest,
    CourseRecommendationRequest,
    MarketStandardsRequest,
    SkillGapRequest,
)
from backend.services.AIService import AIService
from backend.services.AgentService import AgentService
from backend.services.AnalysisService import AnalysisService
from backend.services.MatchingService import MatchingService

router = APIRouter(prefix="/ai", tags=["AI Features"])


def _safe_json(value: Any) -> dict:
    if isinstance(value, dict):
        return value
    if hasattr(value, "json_dict") and value.json_dict:
        return value.json_dict
    if hasattr(value, "raw"):
        value = value.raw
    if isinstance(value, str):
        cleaned = value.strip().replace("```json", "").replace("```", "")
        try:
            return json.loads(cleaned)
        except Exception:
            return {"raw_text": value}
    return {"raw_text": str(value)}


def _extract_skill_names(content: dict) -> list[str]:
    skills = (content or {}).get("skills") or []
    result: list[str] = []
    for skill in skills:
        if isinstance(skill, dict):
            name = skill.get("skill_name") or skill.get("name") or skill.get("title")
        else:
            name = str(skill)
        if name:
            result.append(name.strip())
    return result


def _extract_market_skills(standards: dict) -> list[str]:
    for key in ("required_skills", "technical_skills", "skills", "top_skills", "key_skills"):
        raw = standards.get(key)
        if isinstance(raw, list):
            names = []
            for item in raw:
                if isinstance(item, dict):
                    names.append(item.get("skill") or item.get("name") or item.get("skill_name"))
                else:
                    names.append(str(item))
            return [s.strip() for s in names if s]
    raw_text = standards.get("raw_text", "")
    # Small fallback for non-JSON LLM output: split bullet-like lines.
    lines = [line.strip(" -•\t") for line in raw_text.splitlines()]
    return [line for line in lines if line and len(line) < 60][:10]


def _get_resume_or_404(db_client: Client, resume_id: str, user_id: str) -> dict:
    res = (
        db_client.table("resumes")
        .select("*")
        .eq("id", resume_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    return res.data


@router.post("/market-standards")
async def research_resume_standards(
        data: MarketStandardsRequest,
        current_user=Depends(get_current_user),
        db_client: Client = Depends(db.get_db),
):
    """AI need #3: web researcher that finds current resume/job standards for a target role."""
    researcher = AgentService.get_researcher()
    location_text = f" in {data.location}" if data.location else ""
    task = Task(
        description=(
            f"Research current resume and hiring standards for a {data.job_title}{location_text}. "
            "Return valid JSON only with keys: required_skills, soft_skills, certifications, "
            "ats_keywords, resume_advice, sources. required_skills must be a list of strings."
        ),
        expected_output="Valid JSON with required_skills, soft_skills, certifications, ats_keywords, resume_advice, sources.",
        agent=researcher,
    )
    result = Crew(agents=[researcher], tasks=[task], verbose=True).kickoff()
    standards = _safe_json(result)
    market_skills = _extract_market_skills(standards)

    db_client.table("market_insights_cache").upsert(
        {
            "job_title": data.job_title,
            "search_query": f"market_standards_{data.job_title.lower().replace(' ', '_')}",
            "raw_scraps": standards,
            "key_skills": market_skills,
        },
        on_conflict="search_query",
    ).execute()

    return {"job_title": data.job_title, "standards": standards, "key_skills": market_skills}


@router.post("/cover-letter/generate")
async def generate_cover_letter(
        data: CoverLetterGenerateRequest,
        current_user=Depends(get_current_user),
        db_client: Client = Depends(db.get_db),
):
    """AI need #2: cover letter writer, now actually exposed through the API and saved if requested."""
    user_id = get_user_id(current_user)
    resume_context = None
    if data.resume_id:
        resume = _get_resume_or_404(db_client, str(data.resume_id), user_id)
        resume_context = json.dumps(resume.get("polished_content") or resume.get("raw_content") or {})

    job_context = data.job_position
    if data.company_name:
        job_context += f" at {data.company_name}"
    if data.job_description:
        job_context += f". Job description: {data.job_description}"

    content = AIService.run_cover_letter_pipeline(
        user_data=data.user_data or "Use the user's resume context.",
        job_position=job_context,
        resume_context=resume_context,
    )

    saved = None
    if data.save:
        payload = {
            "user_id": user_id,
            "resume_id": str(data.resume_id) if data.resume_id else None,
            "title": f"Cover letter - {data.job_position}",
            "content": content,
            "type": "ai_generated",
            "job_position": data.job_position,
        }
        res = db_client.table("cover_letters").insert(payload).execute()
        saved = res.data[0] if res.data else None

    return {"content": content, "saved_cover_letter": saved}


@router.post("/resume/{resume_id}/skill-gap")
async def analyze_skill_gap(
        resume_id: UUID,
        data: SkillGapRequest,
        current_user=Depends(get_current_user),
        db_client: Client = Depends(db.get_db),
):
    """AI need #4: compare resume skills against standards and show missing skills."""
    user_id = get_user_id(current_user)
    resume = _get_resume_or_404(db_client, str(resume_id), user_id)
    content = resume.get("polished_content") or resume.get("raw_content") or {}
    user_skills = _extract_skill_names(content)

    market_skills = data.market_skills
    job_title = data.job_title or resume.get("target_job_title") or "target role"

    if not market_skills:
        cached = (
            db_client.table("market_insights_cache")
            .select("key_skills")
            .eq("job_title", job_title)
            .order("last_updated", desc=True)
            .limit(1)
            .execute()
        )
        market_skills = (cached.data or [{}])[0].get("key_skills") if cached.data else []

    if not market_skills:
        raise HTTPException(
            status_code=400,
            detail="No market skills available. Run /ai/market-standards first or pass market_skills.",
        )

    analysis = AnalysisService.calculate_skill_gap(user_skills, market_skills)
    courses = AnalysisService.get_course_recommendations(analysis["missing_skills"], db_client)

    db_client.table("user_analysis_history").insert(
        {
            "user_id": user_id,
            "resume_id": str(resume_id),
            "match_score": int(analysis["match_score"]),
            "skill_gap_analysis": {"job_title": job_title, **analysis, "courses": courses},
        }
    ).execute()

    return {"job_title": job_title, "user_skills": user_skills, "market_skills": market_skills, "analysis": analysis,
            "courses": courses}


@router.get("/resume/{resume_id}/job-matches")
async def match_resume_to_jobs(
        resume_id: UUID,
        current_user=Depends(get_current_user),
        db_client: Client = Depends(db.get_db),
):
    """AI need #5: match a user's CV to active job applications/postings."""
    user_id = get_user_id(current_user)
    resume = _get_resume_or_404(db_client, str(resume_id), user_id)
    content = resume.get("polished_content") or resume.get("raw_content") or {}
    user_skills = _extract_skill_names(content)

    jobs = db_client.table("job_posting").select("*").eq("is_active", True).execute().data or []
    matches = []
    for job in jobs:
        required_skills = job.get("required_skills") or []
        score = MatchingService.calculate_score(user_skills, required_skills)
        match_record = {
            "user_id": user_id,
            "job_id": job["id"],
            "resume_id": str(resume_id),
            "match_score": score,
            "status": "matched",
        }
        existing = (
            db_client.table("job_matches")
            .select("id")
            .eq("user_id", user_id)
            .eq("job_id", job["id"])
            .limit(1)
            .execute()
        )
        if existing.data:
            db_client.table("job_matches").update(match_record).eq("id", existing.data[0]["id"]).execute()
        else:
            db_client.table("job_matches").insert(match_record).execute()
        matches.append({"job": job, "match_score": score})

    matches.sort(key=lambda item: item["match_score"], reverse=True)
    return {"resume_id": str(resume_id), "matches": matches}


@router.post("/resume/{resume_id}/course-recommendations")
async def recommend_courses_for_gaps(
        resume_id: UUID,
        data: CourseRecommendationRequest,
        current_user=Depends(get_current_user),
        db_client: Client = Depends(db.get_db),
):
    """AI need #6: match missing skills to courses stored in the courses table."""
    user_id = get_user_id(current_user)
    _get_resume_or_404(db_client, str(resume_id), user_id)

    missing_skills = data.missing_skills
    if missing_skills is None:
        latest = (
            db_client.table("user_analysis_history")
            .select("skill_gap_analysis")
            .eq("user_id", user_id)
            .eq("resume_id", str(resume_id))
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if latest.data:
            gap = latest.data[0].get("skill_gap_analysis") or {}
            missing_skills = gap.get("missing_skills") or gap.get("missing")

    if not missing_skills:
        raise HTTPException(status_code=400, detail="No missing skills found. Run skill-gap analysis first.")

    courses = AnalysisService.get_course_recommendations(missing_skills, db_client)
    return {"resume_id": str(resume_id), "missing_skills": missing_skills, "courses": courses}
