from typing import List

class MatchingService:
    """Service for calculating whether an applicant meets a job requirement. """
    @staticmethod
    def calculate_score(
        user_skills: List[str],
        required_skills: List[str],
        resume_job_title: str = "",
        job_title: str = "",
    ) -> float:
        title_match = False
        if resume_job_title and job_title:
            u = resume_job_title.lower().strip()
            j = job_title.lower().strip()
            title_match = u == j or u in j or j in u

        if not required_skills:
            return 1.0

        user_skills_set = {s.lower().strip() for s in user_skills}
        required_skills_set = {s.lower().strip() for s in required_skills}
        matches = user_skills_set.intersection(required_skills_set)
        skill_score = len(matches) / len(required_skills_set)

        # Title match contributes a 40% floor; skills fill the remaining 60%.
        if title_match:
            score = 0.6 * skill_score + 0.4
        else:
            score = skill_score

        return round(min(score, 1.0), 2)