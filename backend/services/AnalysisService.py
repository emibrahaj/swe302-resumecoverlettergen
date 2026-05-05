from typing import List, Dict, Any


class AnalysisService:
    """Service for comparing user skills to market/job requirements."""

    @staticmethod
    def _normalize(values: List[Any]) -> list[str]:
        normalized = []
        for value in values or []:
            if isinstance(value, dict):
                value = value.get("skill_name") or value.get("name") or value.get("skill_category") or ""
            text = str(value).strip()
            if text:
                normalized.append(text)
        return normalized

    @staticmethod
    def calculate_skill_gap(user_skills: List[str], market_skills: List[str]) -> Dict[str, Any]:
        user_clean = AnalysisService._normalize(user_skills)
        market_clean = AnalysisService._normalize(market_skills)

        user_map = {s.lower(): s for s in user_clean}
        market_map = {s.lower(): s for s in market_clean}

        missing_keys = [key for key in market_map if key not in user_map]
        matching_keys = [key for key in market_map if key in user_map]

        match_count = len(matching_keys)
        total_market_skills = len(market_map)
        score = (match_count / total_market_skills * 100) if total_market_skills > 0 else 0

        return {
            "match_score": round(score, 2),
            "missing_skills": [market_map[key] for key in missing_keys],
            "matching_skills": [market_map[key] for key in matching_keys],
        }

    @staticmethod
    def get_course_recommendations(missing_skills: List[str], db_client):
        """Return courses for missing skills.

        Supabase `.in_()` is exact/case-sensitive, while AI skills may arrive as
        `python`, `Python`, or `Python programming`. This method fetches a small
        course list and filters case-insensitively so recommendations actually appear.
        """
        if not missing_skills:
            return []

        missing_lower = {str(skill).strip().lower() for skill in missing_skills if str(skill).strip()}
        if not missing_lower:
            return []

        response = db_client.table("courses").select("*").execute()
        courses = response.data or []

        matched = []
        for course in courses:
            category = str(course.get("skill_category") or "").strip().lower()
            title = str(course.get("title") or "").strip().lower()
            if any(skill == category or skill in title or category in skill for skill in missing_lower):
                matched.append(course)
            if len(matched) >= 3:
                break

        return matched
