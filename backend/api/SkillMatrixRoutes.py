"""
Skill Matrix API — runs the 8-dimension scoring on a resume and persists results.

POST /resume/{resume_id}/skill-matrix       -> compute fresh scores, save, return
GET  /resume/{resume_id}/skill-matrix/latest -> read most recent saved scores
"""
from __future__ import annotations

import re
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.SkillMatrixSchema import (
    CourseRecommendation,
    DimensionDetail,
    SkillMatrixResponse,
)
from backend.services.AnalysisService import AnalysisService
from backend.services.AIDataService import AIDataService
from backend.services.MarketResearchService import MarketResearchService
from backend.services.SkillMatrixService import SkillMatrixService

router = APIRouter(prefix="/resume", tags=["skill-matrix"])


def _get_owned_resume(db_client: Client, resume_id: str, user_id: str) -> dict[str, Any]:
    # .single() raises (PGRST116) when there isn't exactly one row, so wrap it and
    # turn "no rows" into a clean 404 instead of an unhandled 500.
    try:
        res = (
            db_client.table("resumes")
            .select("*")
            .eq("id", resume_id)
            .single()
            .execute()
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not getattr(res, "data", None):
        raise HTTPException(status_code=404, detail="Resume not found")
    owner = res.data.get("user_id")
    if owner and owner != user_id:
        raise HTTPException(status_code=403, detail="Not your resume")
    return res.data


def _build_extras(
    resume: dict[str, Any],
    content: dict[str, Any],
    db_client: Client,
    market_skills: list[str],
    raw_courses: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Compute the missing/matching skills + recommended courses bundle that the
    Resume Analyzer page renders alongside the matrix. Mirrors the same helpers
    the AI pipeline uses so the analyzer reflects real data, not mock arrays.

    All branches degrade to empty results on error — this is an "extras" bundle,
    not the primary response, so a hiccup here must not 500 the whole analyze."""
    empty = {"missing_skills": [], "matching_skills": [], "recommended_courses": [], "target_job_title": None}
    try:
        user_skills = AIDataService.extract_skill_names(content) or []
        gap = AnalysisService.calculate_skill_gap(user_skills, market_skills or []) or {}
        missing = [str(s) for s in (gap.get("missing_skills") or []) if s]
        matching = [str(s) for s in (gap.get("matching_skills") or []) if s]
    except Exception as exc:
        print(f"[SkillMatrix] skill-gap calc failed: {exc!r}")
        return empty

    courses: list[CourseRecommendation] = []
    try:
        if raw_courses is None:
            raw_courses = AnalysisService.get_course_recommendations(missing, db_client) or []
        for c in raw_courses:
            if not isinstance(c, dict):
                continue
            # The courses table columns are: id, title, skill_category,
            # affiliate_link, discount_code. Map them onto the wider
            # CourseRecommendation shape and stringify defensively so unexpected
            # DB types (e.g. price stored as numeric) don't trip pydantic.
            courses.append(
                CourseRecommendation(
                    id=str(c.get("id")) if c.get("id") is not None else None,
                    title=str(c.get("title")) if c.get("title") is not None else None,
                    provider=str(c.get("provider")) if c.get("provider") is not None else None,
                    skill_category=str(c.get("skill_category")) if c.get("skill_category") is not None else None,
                    duration=str(c.get("duration")) if c.get("duration") is not None else None,
                    price=str(c.get("price")) if c.get("price") is not None else None,
                    url=(
                        str(c.get("affiliate_link"))
                        if c.get("affiliate_link")
                        else (str(c.get("url")) if c.get("url") else (str(c.get("link")) if c.get("link") else None))
                    ),
                    relevance=int(c.get("relevance")) if isinstance(c.get("relevance"), (int, float)) else None,
                )
            )
    except Exception as exc:
        print(f"[SkillMatrix] course recommendation lookup failed: {exc!r}")
        courses = []

    target = (
        resume.get("target_job_title")
        or (resume.get("raw_content") or {}).get("target_job_title")
        or ""
    )
    return {
        "missing_skills": missing,
        "matching_skills": matching,
        "recommended_courses": courses,
        "target_job_title": target or None,
    }


def _target_title(resume: dict[str, Any]) -> str:
    return (
        resume.get("target_job_title")
        or (resume.get("raw_content") or {}).get("target_job_title")
        or ""
    )


def _market_skills_for(resume: dict[str, Any], db_client: Client) -> list[str]:
    """Read-only: cached market skills for the resume's target job title, or [].

    Uses the canonical normalized lookup so casing/whitespace in the title don't
    cause a miss. Does NOT trigger research — read paths (GET latest, extras)
    must stay cheap. The POST compute path populates the cache separately.
    """
    return MarketResearchService.cached_skills(db_client, _target_title(resume))


@router.post("/{resume_id}/skill-matrix", response_model=SkillMatrixResponse)
async def compute_skill_matrix(
    resume_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    resume = _get_owned_resume(db_client, resume_id, user_id)

    content = resume.get("polished_content") or resume.get("raw_content") or {}
    if not content:
        raise HTTPException(status_code=409, detail="Resume has no content to score yet. Save the resume first.")

    # Resolve market keywords for the keyword dimension. On a cache miss this runs
    # the researcher agent inline and caches the result, so the first analyze per
    # job title is slower but every subsequent one is a cache hit.
    market = MarketResearchService.ensure_market_skills(db_client, _target_title(resume))
    try:
        scores = SkillMatrixService.score_all(content, market_skills=market)
    except Exception as exc:
        import traceback
        print(f"[SkillMatrix] score_all crashed: {exc!r}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Could not score this resume: {exc}",
        ) from exc

    # Skill-gap + course recommendations: persisted into resume_feedback's analyzer
    # columns (suggestions/skill_gaps/critical_fixes/learning_path) and reused for
    # the response's extras bundle so we don't query courses twice.
    user_skills = AIDataService.extract_skill_names(content)
    gap = AnalysisService.calculate_skill_gap(user_skills, market) or {}
    missing_skills = [str(s) for s in (gap.get("missing_skills") or []) if s]
    matching_skills = [str(s) for s in (gap.get("matching_skills") or []) if s]
    try:
        course_dicts = AnalysisService.get_course_recommendations(missing_skills, db_client) or []
    except Exception as exc:
        print(f"[SkillMatrix] course lookup failed: {exc!r}")
        course_dicts = []

    feedback_payload = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "resume_id": resume_id,
        "overall_score": scores["overall"],
        "experience_score": scores["experience"],
        "education_score": scores["education"],
        "technical_skills_score": scores["technical_skills"],
        "soft_skills_score": scores["soft_skills"],
        "achievements_score": scores["achievements"],
        "keywords_score": scores["keywords"],
        "formatting_score": scores["formatting"],
        "job_relevance_score": scores["job_relevance"],
        "content_score": scores["overall"],
        "ats_compatibility_score": scores["keywords"],
        "dimensions": scores["dimensions"],
        "suggestions": {
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "recommended_courses": course_dicts,
            "message": "Skill matrix analysis generated successfully.",
        },
        "critical_fixes": missing_skills[:5],
        "learning_path": {"recommended_courses": course_dicts},
        "skill_gaps": missing_skills,
    }
    # Older Supabase instances may be missing the skill-matrix columns from
    # migration 003 (experience_score, dimensions, etc.). Drop unknown columns
    # one-by-one based on PostgREST's PGRST204 error and retry.
    feedback_id = feedback_payload["id"]
    last_db_error: str | None = None
    for _ in range(len(feedback_payload)):
        try:
            inserted = db_client.table("resume_feedback").insert(feedback_payload).execute()
            feedback_id = inserted.data[0]["id"] if inserted.data else feedback_id
            last_db_error = None
            break
        except Exception as ex:
            msg = str(ex)
            last_db_error = msg
            m = re.search(r"Could not find the '([^']+)' column", msg)
            if not m or m.group(1) not in feedback_payload:
                # The error isn't a missing-column we can recover from. Don't
                # blow up the whole request — the user already got their scores
                # computed, persistence is a nice-to-have.
                import traceback
                print(f"[SkillMatrix] resume_feedback insert failed (non-recoverable): {msg}")
                traceback.print_exc()
                break
            feedback_payload.pop(m.group(1), None)
    else:
        # We exhausted retries dropping columns — still don't 500, fall through
        # with no feedback_id so the user gets their analysis without a DB row.
        print(f"[SkillMatrix] gave up persisting scores after all retries; last error: {last_db_error}")

    if last_db_error is None:
        try:
            db_client.table("resumes").update({"last_analysis_id": feedback_id}).eq("id", resume_id).execute()
        except Exception as ex:
            # Don't fail the analyze just because the back-link couldn't be saved.
            print(f"[SkillMatrix] could not update resumes.last_analysis_id: {ex}")

    try:
        dims = {
            k: DimensionDetail(score=int(v.get("score") or 0), reason=str(v.get("reason") or ""))
            for k, v in (scores.get("dimensions") or {}).items()
        }
    except Exception as exc:
        print(f"[SkillMatrix] dimensions normalization failed: {exc!r}")
        dims = {}

    extras = _build_extras(resume, content, db_client, market, raw_courses=course_dicts)

    try:
        return SkillMatrixResponse(
            resume_id=resume_id,
            overall=int(scores.get("overall") or 0),
            experience=int(scores.get("experience") or 0),
            education=int(scores.get("education") or 0),
            technical_skills=int(scores.get("technical_skills") or 0),
            soft_skills=int(scores.get("soft_skills") or 0),
            achievements=int(scores.get("achievements") or 0),
            keywords=int(scores.get("keywords") or 0),
            formatting=int(scores.get("formatting") or 0),
            job_relevance=int(scores.get("job_relevance") or 0),
            dimensions=dims,
            feedback_id=feedback_id,
            **extras,
        )
    except Exception as exc:
        import traceback
        print(f"[SkillMatrix] response model build failed: {exc!r}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Skill matrix produced invalid data: {exc}",
        ) from exc


@router.get("/{resume_id}/skill-matrix/latest", response_model=SkillMatrixResponse)
async def get_latest_skill_matrix(
    resume_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    resume = _get_owned_resume(db_client, resume_id, user_id)

    res = (
        db_client.table("resume_feedback")
        .select("*")
        .eq("resume_id", resume_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="No skill-matrix scores yet for this resume")

    row = res.data[0]
    dims_raw = row.get("dimensions") or {}
    dims: dict[str, DimensionDetail] = {}
    if isinstance(dims_raw, dict):
        for k, v in dims_raw.items():
            if isinstance(v, dict):
                dims[k] = DimensionDetail(
                    score=int(v.get("score") or 0),
                    reason=str(v.get("reason") or ""),
                )

    def _g(col: str) -> int:
        val = row.get(col)
        return int(val) if isinstance(val, (int, float)) else 0

    content = resume.get("polished_content") or resume.get("raw_content") or {}
    market = _market_skills_for(resume, db_client)
    extras = _build_extras(resume, content, db_client, market)

    return SkillMatrixResponse(
        resume_id=resume_id,
        overall=_g("overall_score"),
        experience=_g("experience_score"),
        education=_g("education_score"),
        technical_skills=_g("technical_skills_score"),
        soft_skills=_g("soft_skills_score"),
        achievements=_g("achievements_score"),
        keywords=_g("keywords_score"),
        formatting=_g("formatting_score"),
        job_relevance=_g("job_relevance_score"),
        dimensions=dims,
        feedback_id=row.get("id"),
        created_at=row.get("created_at"),
        **extras,
    )
