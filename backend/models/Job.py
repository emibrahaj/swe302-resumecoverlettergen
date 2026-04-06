class JobRecommendation:
    # show's the user a job post
    def __init__(self, recommendation_id, user_id, job_id):
        self.recommendation_id = recommendation_id
        self.user_id = user_id
        self.job_id = job_id

class MarketInsight:
    # store data for job role
    def __init__(self, insight_id, role_name):
        self.insight_id = insight_id
        self.role_name = role_name



