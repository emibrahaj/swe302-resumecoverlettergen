from typing import Optional
from uuid import UUID


class ResumeAnalysis:
    def __init__(self, analysis_id, resume_id, overall_score = 0):
        self.analysis_id= analysis_id
        self.resume_id= resume_id
        self.overall_score= overall_score
        # strengths
        # weaknesses

class ResumeFeedback:
    def __init__(self, id: UUID, resume_id: UUID, user_id: UUID, overall_score: Optional[int],
                 content_score: Optional[int], formatting_score: Optional[int], ats_compatibility_score: Optional[int],
                 suggestions: Optional[str], critical_fixes: Optional[str]):
        self.id = id
        self.resume_id = resume_id
        self.user_id = user_id
        self.overall_score = overall_score
        self.content_score = content_score
        self.formatting_score = formatting_score
        self.ats_compatibility_score = ats_compatibility_score
        self.suggestions = suggestions
        self.critical_fixes = critical_fixes

class Insights:
    # stores the score between the user resume and a target job
    def __init__(self, fit_id, resume_id, target_role_name, match_percentage=0):
        self.fit_id = fit_id
        self.resume_id = resume_id
        self.target_role_name = target_role_name
        self.match_percentage = match_percentage
