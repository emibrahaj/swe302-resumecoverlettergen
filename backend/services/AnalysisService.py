from typing import List, Dict

class AnalysisService:
    @staticmethod
    def calculate_skill_gap(user_skills: List[str], market_skills: List[str]) -> Dict[str, float]:
        user_set = {s.lower() for s in user_skills}
        market_set = {s.lower() for s in market_skills}

        missing_skills = list(market_set - user_set)

        match_count = len(market_set.intersection(user_set))
        total_market_skills = len(market_set)

        score = (match_count / total_market_skills * 100) if total_market_skills > 0 else 0

        return {
            "match_score": round(score, 2),
            "missing_skills": missing_skills,
            "matching_skills": list(market_set.intersection(user_set))
        }

    @staticmethod
    def get_course_recommendations(missing_skills: List[str], db_client):
        if not missing_skills:
            return []

        response = db_client.table("courses").select("*").in_("skill_category", missing_skills).limit(3).execute()
        return response.data