import re
from typing import List, Dict, Any, Set

# Filler words that shouldn't drive skill matching (e.g. "Communication Skills" -> "communication").
_SKILL_STOPWORDS = {"and", "or", "of", "the", "a", "an", "in", "for", "to", "with", "skill", "skills"}


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
    def _tokenize(skill: str) -> Set[str]:
        return {t for t in re.split(r"[^a-z0-9]+", skill.lower()) if t and t not in _SKILL_STOPWORDS}

    @staticmethod
    def _skill_matches(market_tokens: Set[str], user_token_sets: List[Set[str]]) -> bool:
        """A market skill counts as covered when a user skill is the same set of
        significant words, or one is a subset of the other. This makes matching
        tolerant of punctuation/word-order ("problem solving" == "problem-solving")
        and of broader/narrower phrasing ("management" covers "time management")."""
        if not market_tokens:
            return False
        for user_tokens in user_token_sets:
            if not user_tokens:
                continue
            if market_tokens <= user_tokens or user_tokens <= market_tokens:
                return True
        return False

    @staticmethod
    def calculate_skill_gap(user_skills: List[str], market_skills: List[str]) -> Dict[str, Any]:
        user_clean = AnalysisService._normalize(user_skills)
        market_clean = AnalysisService._normalize(market_skills)

        # Deduplicate market skills case-insensitively, keeping display casing.
        market_map = {s.lower(): s for s in market_clean}
        user_token_sets = [AnalysisService._tokenize(u) for u in user_clean]

        matching: List[str] = []
        missing: List[str] = []
        for display in market_map.values():
            market_tokens = AnalysisService._tokenize(display)
            if AnalysisService._skill_matches(market_tokens, user_token_sets):
                matching.append(display)
            else:
                missing.append(display)

        total_market_skills = len(market_map)
        score = (len(matching) / total_market_skills * 100) if total_market_skills > 0 else 0

        return {
            "match_score": round(score, 2),
            "missing_skills": missing,
            "matching_skills": matching,
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
