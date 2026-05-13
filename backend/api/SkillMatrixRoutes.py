"""
Skill Matrix API — runs the 8-dimension scoring on a resume and persists results.

POST /resume/{resume_id}/skill-matrix       -> compute fresh scores, save, return
GET  /resume/{resume_id}/skill-matrix/latest -> read most recent saved scores
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.auth.auth_handler import get_current_user, get_user_id
from backend.database.db import db
from backend.schemas.SkillMatrixSchema import DimensionDetail, SkillMatrixResponse
from backend.services.SkillMatrixService import SkillMatrixService

router = APIRouter(prefix="/resume", tags=["skill-matrix"])


def _get_owned_resume(db_client: Client, resume_id: str, user_id: str) -> dict[str, Any]:
    res = (
        db_client.table("resumes")
        .select("*")
        .eq("id", resume_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    owner = res.data.get("user_id")
    if owner and owner != user_id:
        raise HTTPException(status_code=403, detail="Not your resume")
    return res.data


def _market_skills_for(resume: dict[str, Any], db_client: Client) -> list[str]:
    """Pull cached market skills for the resume's target job title, or empty list."""
    target = (
        resume.get("target_job_title")
        or (resume.get("raw_content") or {}).get("target_job_title")
        or ""
    )
    if not target:
        return []
    cache = (
        db_client.table("market_insights_cache")
        .select("key_skills")
        .eq("job_title", target)
        .limit(1)
        .execute()
    )
    if cache.data:
        ks = cache.data[0].get("key_skills") or []
        if isinstance(ks, list):
            return [str(s) for s in ks if s]
    return []


@router.post("/{resume_id}/skill-matrix", response_model=SkillMatrixResponse)
async def compute_skill_matrix(
    resume_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    resume = _get_owned_resume(db_client, resume_id, user_id)

    content = resume.get("polished_content") or resume.get("raw_content") or {}
    market = _market_skills_for(resume, db_client)
    scores = SkillMatrixService.score_all(content, market_skills=market)

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
        "content_score": scores["experience"],
        "formatting_score": scores["formatting"],
        "ats_compatibility_score": scores["keywords"],
        "dimensions": scores["dimensions"],
    }
    inserted = db_client.table("resume_feedback").insert(feedback_payload).execute()
    feedback_id = inserted.data[0]["id"] if inserted.data else feedback_payload["id"]

    db_client.table("resumes").update({"last_analysis_id": feedback_id}).eq("id", resume_id).execute()

    dims = {
        k: DimensionDetail(score=int(v["score"]), reason=str(v.get("reason") or ""))
        for k, v in scores["dimensions"].items()
    }

    return SkillMatrixResponse(
        resume_id=resume_id,
        overall=scores["overall"],
        experience=scores["experience"],
        education=scores["education"],
        technical_skills=scores["technical_skills"],
        soft_skills=scores["soft_skills"],
        achievements=scores["achievements"],
        keywords=scores["keywords"],
        formatting=scores["formatting"],
        job_relevance=scores["job_relevance"],
        dimensions=dims,
        feedback_id=feedback_id,
    )


@router.get("/{resume_id}/skill-matrix/latest", response_model=SkillMatrixResponse)
async def get_latest_skill_matrix(
    resume_id: str,
    current_user=Depends(get_current_user),
    db_client: Client = Depends(db.get_db),
):
    user_id = get_user_id(current_user)
    _get_owned_resume(db_client, resume_id, user_id)

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
    )
