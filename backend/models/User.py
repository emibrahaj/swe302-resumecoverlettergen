import datetime
from typing import Optional, Dict, Any
from uuid import UUID


class User:
    def __init__(self, user_id, name, email, created_at, last_login, profile: UserProfile):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.created_at = created_at
        self.last_login = last_login


class UserProfile:
    def __init__(self, id: UUID, first_name: Optional[str], last_name: Optional[str], avatar_url: Optional[str],
                 tier: str = "free", created_at: Optional[datetime] = None):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.full_name = f"{first_name} {last_name}"
        self.avatar_url = avatar_url
        self.tier = tier
        self.created_at = created_at


class CompanyProfile:
    def __init__(self, id: UUID, company_name: str, logo_url: Optional[str] = None, contact_email: Optional[str] = None,
                 company_website: Optional[str] = None, is_verified: bool = False,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.company_name = company_name
        self.company_website = company_website
        self.logo_url = logo_url
        self.contact_email = contact_email
        self.is_verified = is_verified
        self.created_at = created_at


class UserAnalysisHistory:
    def __init__(self, id: UUID, user_id: Optional[UUID], resume_id: Optional[UUID], match_score: Optional[int],
                 skill_gap_analysis: Optional[Dict[str, Any]], cv_embedding_id: Optional[UUID],
                 created_at: Optional[datetime], ):
        self.id = id
        self.user_id = user_id
        self.resume_id = resume_id
        self.match_score = match_score
        self.skill_gap_analysis = skill_gap_analysis or {}
        self.cv_embedding_id = cv_embedding_id
        self.created_at = created_at
