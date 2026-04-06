class ResumeAnalysis:
    def __init__(self, analysis_id, resume_id, overall_score = 0):
        self.analysis_id= analysis_id
        self.resume_id= resume_id
        self.overall_score= overall_score
        # strengths
        # weaknesses

class ResumeFeedback:
    # points to the user a numbered list of tips
    def __init__(self, feedback_id, resume_id):
        self.feedback_id= feedback_id
        self.resume_id= resume_id


class Insights:
    # stores the score between the user resume and a target job
    def __init__(self, fit_id, resume_id, target_role_name, match_percentage=0):
        self.fit_id = fit_id
        self.resume_id = resume_id
        self.target_role_name = target_role_name
        self.match_percentage = match_percentage
