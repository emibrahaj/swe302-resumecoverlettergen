from typing import List

class MatchingService:
    @staticmethod
    def calculate_score(user_skills: List[str], required_skills: List[str]) -> float:
        if not required_skills:
            return 1.0

        user_skills_set = {s.lower().strip() for s in user_skills}
        required_skills_set = {s.lower().strip() for s in required_skills}

        matches = user_skills_set.intersection(required_skills_set)

        # Calculate ratio
        score = len(matches) / len(required_skills_set)
        return round(score, 2)