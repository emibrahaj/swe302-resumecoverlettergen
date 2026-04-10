import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID


class JobPosting:
    # shows the user a job post
    def __init__(self, id, company_id, company_name, job_titl, required_skills=None, is_active=True):
        self.id = id
        self.company_id = company_id
        self.company_name = company_name
        self.job_title = job_titl
        self.required_skills = required_skills or []
        self.is_active = is_active


class JobAnalysis:
    def __init__(self, id: UUID, resume_id: Optional[UUID], output_score: Optional[int],
                 top_missing_skills: Optional[List[str]], top_advice: Optional[List[str]],
                 competitor_analysis: Optional[str], created_at: Optional[datetime], user_id: Optional[UUID]):
        self.id = id
        self.resume_id = resume_id
        self.output_score = output_score
        self.top_missing_skills = top_missing_skills
        self.top_advice = top_advice
        self.competitor_analysis = competitor_analysis
        self.created_at = created_at
        self.user_id = user_id


class JobInvitation:
    def __init__(self, id: UUID, job_id: Optional[UUID], user_id: Optional[UUID], status: str = "pending",
                 created_at: Optional[datetime] = None):
        self.id = id
        self.job_id = job_id
        self.user_id = user_id
        self.status = status
        self.created_at = created_at


class MarketInsightCache:
    # stores data for job role
    def __init__(self, id: UUID, job_title: str = "", company_name: Optional[str] = None,
            search_query: Optional[str] = None, raw_scraps: Optional[Dict[str, Any]] = None,
            key_skills: Optional[List[str]] = None, last_updated: Optional[datetime] = None, ):
        self.id = id
        self.job_title = job_title
        self.company_name = company_name
        self.search_query = search_query
        self.raw_scraps = raw_scraps
        self.key_skills = key_skills
        self.last_updated = last_updated


class Subscription:
    def __init__(self, id: UUID, user_id: UUID, plan: str, status: str, price: Optional[float], start_date: Optional[datetime], end_date: Optional[datetime]):
        self.id = id
        self.user_id = user_id
        self.plan = plan
        self.status = status
        self.price = price
        self.start_date = start_date
        self.end_date = end_date

class Payment:
    def __init__(self, id: UUID, subscription_id: Optional[UUID], user_id: Optional[UUID], amount: float, currency: str = "USD", status: str = None, stripe_payment_intent_id: Optional[str] = None, created_at: Optional[datetime] = None):
        self.id = id
        self.subscription_id = subscription_id
        self.user_id = user_id
        self.amount = amount
        self.currency = currency
        self.status = status
        self.stripe_payment_intent_id = stripe_payment_intent_id
        self.created_at = created_at
