from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from supabase import Client


class AIDataService:
    """Centralized persistence helpers for AI-generated data.

    These helpers intentionally keep AI/database saving logic out of route files.
    They match the current Supabase schema: resumes, resume_feedback,
    job_analysis, analysis_metrics, competitor_profiles, market_insights_cache,
    user_analysis_history, job_matches, and course_usage.
    """

    @staticmethod
    def _utc_now() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _clean_string_list(values: Any) -> List[str]:
        if not values:
            return []
        if isinstance(values, str):
            values = [part.strip() for part in values.replace("\n", ",").split(",")]
        cleaned: List[str] = []
        for value in values:
            if isinstance(value, dict):
                text = value.get("skill_name") or value.get("name") or value.get("title") or value.get("label")
            else:
                text = str(value)
            text = (text or "").strip()
            if text:
                cleaned.append(text)
        # keep display casing but remove duplicates case-insensitively
        seen = set()
        unique = []
        for item in cleaned:
            key = item.lower()
            if key not in seen:
                seen.add(key)
                unique.append(item)
        return unique

    @staticmethod
    def extract_skill_names(content: Dict[str, Any]) -> List[str]:
        skills = content.get("skills", []) if isinstance(content, dict) else []
        return AIDataService._clean_string_list(skills)

    @staticmethod
    def extract_market_skills(ai_output: Dict[str, Any]) -> List[str]:
        if not isinstance(ai_output, dict):
            return []
        possible_keys = [
            "skills",
            "top_skills",
            "key_skills",
            "required_skills",
            "missing_skills",
            "market_skills",
        ]
        for key in possible_keys:
            value = ai_output.get(key)
            cleaned = AIDataService._clean_string_list(value)
            if cleaned:
                return cleaned
        raw_text = ai_output.get("raw_text") or ai_output.get("raw") or ""
        return AIDataService._clean_string_list(raw_text)

    @staticmethod
    def save_market_insights(
        db_client: Client,
        job_title: str,
        key_skills: List[str],
        raw_scraps: Dict[str, Any] | List[Any] | str | None,
        company_name: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        if not job_title:
            return None
        search_query = f"market_trends_{job_title.lower().strip().replace(' ', '_')}"
        payload = {
            "job_title": job_title,
            "company_name": company_name,
            "search_query": search_query,
            "key_skills": AIDataService._clean_string_list(key_skills),
            "raw_scraps": raw_scraps if raw_scraps is not None else {},
            "last_updated": AIDataService._utc_now(),
        }
        res = db_client.table("market_insights_cache").upsert(payload, on_conflict="search_query").execute()
        return res.data[0] if res.data else payload

    @staticmethod
    def update_resume_ai_fields(
        db_client: Client,
        resume_id: str,
        market_insights: Any = None,
        learning_recommendations: Any = None,
        last_analysis_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        payload: Dict[str, Any] = {}
        if market_insights is not None:
            payload["ai_market_insights"] = market_insights
        if learning_recommendations is not None:
            payload["ai_learning_recommendations"] = learning_recommendations
        if last_analysis_id:
            payload["last_analysis_id"] = last_analysis_id
        if not payload:
            return None
        res = db_client.table("resumes").update(payload).eq("id", str(resume_id)).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def save_resume_feedback(
        db_client: Client,
        user_id: Optional[str],
        resume_id: str,
        analysis: Dict[str, Any],
        courses: List[Dict[str, Any]],
        suggestions: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Save resume-level analysis in resume_feedback and link it from resumes.last_analysis_id.

        resume_feedback.user_id is NOT nullable in the schema, so this is skipped for guests.
        """
        if not user_id:
            return None

        match_score = int(round(float(analysis.get("match_score", 0))))
        missing_skills = AIDataService._clean_string_list(analysis.get("missing_skills", []))
        matching_skills = AIDataService._clean_string_list(analysis.get("matching_skills", []))

        feedback_payload = {
            "user_id": str(user_id),
            "resume_id": str(resume_id),
            "overall_score": max(0, min(100, match_score)),
            "content_score": max(0, min(100, match_score)),
            "formatting_score": 80,
            "ats_compatibility_score": max(0, min(100, match_score)),
            "suggestions": suggestions or {
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "recommended_courses": courses,
                "message": "AI resume analysis generated successfully.",
            },
            "critical_fixes": missing_skills[:5],
            "learning_path": {"recommended_courses": courses},
            "skill_gaps": missing_skills,
        }

        res = db_client.table("resume_feedback").insert(feedback_payload).execute()
        feedback = res.data[0] if res.data else None
        if feedback and feedback.get("id"):
            AIDataService.update_resume_ai_fields(
                db_client=db_client,
                resume_id=str(resume_id),
                learning_recommendations=courses,
                last_analysis_id=str(feedback["id"]),
            )
        return feedback

    @staticmethod
    def save_user_analysis_history(
        db_client: Client,
        user_id: Optional[str],
        resume_id: str,
        analysis: Dict[str, Any],
        courses: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        if not user_id:
            return None
        payload = {
            "user_id": str(user_id),
            "resume_id": str(resume_id),
            "match_score": int(round(float(analysis.get("match_score", 0)))),
            "skill_gap_analysis": {
                "missing": AIDataService._clean_string_list(analysis.get("missing_skills", [])),
                "matching": AIDataService._clean_string_list(analysis.get("matching_skills", [])),
                "courses": courses,
            },
        }
        res = db_client.table("user_analysis_history").insert(payload).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def save_job_analysis_bundle(
        db_client: Client,
        user_id: Optional[str],
        resume_id: str,
        analysis: Dict[str, Any],
        market_insights: Dict[str, Any],
        metrics: Optional[List[Dict[str, float]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Save job_analysis plus related metrics and web research/competitor profile.

        Some of these tables are useful for richer reporting later. If one optional child insert fails,
        the main analysis save still remains useful.
        """
        if not user_id:
            return None

        missing_skills = AIDataService._clean_string_list(analysis.get("missing_skills", []))
        top_advice = analysis.get("top_advice") or [
            f"Improve or add evidence for {skill}" for skill in missing_skills[:5]
        ]
        output_score = int(round(float(analysis.get("match_score", 0))))

        job_payload = {
            "user_id": str(user_id),
            "resume_id": str(resume_id),
            "output_score": max(0, min(100, output_score)),
            "top_missing_skills": missing_skills[:10],
            "top_advice": AIDataService._clean_string_list(top_advice)[:10],
        }
        res = db_client.table("job_analysis").insert(job_payload).execute()
        job_analysis = res.data[0] if res.data else None
        if not job_analysis or not job_analysis.get("id"):
            return job_analysis

        job_analysis_id = str(job_analysis["id"])

        try:
            comp_payload = {
                "job_analysis_id": job_analysis_id,
                "source": "ai_market_research",
                "extracted_data": market_insights or {},
            }
            comp_res = db_client.table("competitor_profiles").insert(comp_payload).execute()
            if comp_res.data:
                db_client.table("job_analysis").update({
                    "competitor_profiles_id": comp_res.data[0]["id"]
                }).eq("id", job_analysis_id).execute()
                job_analysis["competitor_profile"] = comp_res.data[0]
        except Exception as exc:
            print(f"Could not save competitor profile: {exc}")

        metric_rows = metrics or [
            {
                "metric_name": "skill_match",
                "user_score": float(analysis.get("match_score", 0)),
                "benchmark_score": 100.0,
            },
            {
                "metric_name": "missing_skill_count",
                "user_score": float(len(missing_skills)),
                "benchmark_score": 0.0,
            },
        ]
        try:
            rows = [{"job_analysis_id": job_analysis_id, **row} for row in metric_rows]
            if rows:
                metrics_res = db_client.table("analysis_metrics").insert(rows).execute()
                job_analysis["metrics"] = metrics_res.data or []
        except Exception as exc:
            print(f"Could not save analysis metrics: {exc}")

        return job_analysis

    @staticmethod
    def save_course_usage(db_client: Client, user_id: Optional[str], course_ids: List[str]) -> List[Dict[str, Any]]:
        if not user_id or not course_ids:
            return []
        rows = [{"user_id": str(user_id), "course_id": str(course_id)} for course_id in course_ids if course_id]
        if not rows:
            return []
        res = db_client.table("course_usage").insert(rows).execute()
        return res.data or []
