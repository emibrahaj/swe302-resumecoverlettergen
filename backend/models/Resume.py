import datetime
from typing import Optional, Dict, Any
from uuid import UUID


class Resume:
    def __init__(self, user_id: UUID, target_job_title: str = None, id: UUID = None, profile_picture=None,
                 target_job_description: Optional[str] = None, polished_content: Optional[Dict[str, Any]] = None,
                 premium_analysis: bool = False, template_id: Optional[UUID] = None,
                 created_at: Optional[datetime] = None, ):
        self.id = id
        self.user_id = user_id

        self.target_job_title = target_job_title
        self.profile_picture = str(profile_picture) if profile_picture else None
        self.target_job_description = target_job_description

        self.polished_content = polished_content
        self.premium_analysis = premium_analysis

        self.template_id = template_id
        self.created_at = created_at

        self.education = []
        self.experiences = []
        self.skills = []
        self.languages = []
        self.certifications = []
        self.trainings = []
        self.projects = []

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "target_job_title": self.target_job_title,
            "raw_content": {"profile_picture": self.profile_picture, "education": [vars(e) for e in self.education],
                "experiences": [vars(ex) for ex in self.experiences], "skills": [vars(s) for s in self.skills],
                "languages": [vars(l) for l in self.languages],
                "certifications": [vars(c) for c in self.certifications],
                "trainings": [vars(t) for t in self.trainings], "projects": [vars(p) for p in self.projects]}}

    @staticmethod
    def from_dict(data: dict):
        resume = Resume(user_id=data.get("user_id"), id=data.get("id"), target_job_title=data.get("target_job_title"))

        raw = data.get("raw_content", {})

        resume.profile_picture = raw.get("profile_picture")

        resume.education = [Education(**e) for e in raw.get("education", [])]
        resume.experiences = [Experience(**e) for e in raw.get("experiences", [])]
        resume.skills = [Skill(**s) for s in raw.get("skills", [])]
        resume.languages = [Language(**l) for l in raw.get("languages", [])]
        resume.certifications = [Certification(**c) for c in raw.get("certifications", [])]
        resume.trainings = [Training(**t) for t in raw.get("trainings", [])]
        resume.projects = [Project(**p) for p in raw.get("projects", [])]

        return resume


class Education:
    def __init__(self, education_id, university, degree, start_date, end_date):
        self.education_id = education_id
        self.university = university
        self.degree = degree
        self.start_date = start_date
        self.end_date = end_date


class Experience:
    def __init__(self, experience_id, company_name, role, start_date, end_date, is_current, description):
        self.experience_id = experience_id
        self.company_name = company_name
        self.role = role
        self.start_date = start_date
        self.end_date = end_date
        self.is_current = is_current
        self.description = description


class Skill:
    def __init__(self, skill_id, skill_name, proficiency):
        self.skill_id = skill_id
        self.skill_name = skill_name
        self.proficiency = proficiency


class Certification:
    def __init__(self, certification_id, certification_name, date_obtained, company_name):
        self.certification_id = certification_id
        self.certification_name = certification_name
        self.date_obtained = date_obtained
        self.company_name = company_name


class Training:
    def __init__(self, training_id, training_name, start_date, date_obtained, company_name):
        self.training_id = training_id
        self.training_name = training_name
        self.training_start_date = start_date
        self.training_finished_date = date_obtained
        self.training_company = company_name


class Language:
    def __init__(self, language_id, language_name, proficiency):
        self.language_id = language_id
        self.language_name = language_name
        self.proficiency = proficiency


class Project:
    def __init__(self, project_id, project_name, description, start_date, end_date, link):
        self.project_id = project_id
        self.project_name = project_name
        self.description = description
        self.start_date = start_date
        self.end_date = end_date
        self.link = link


class CoverLetter:
    def __init__(self, id: UUID, user_id: Optional[UUID], resume_id: Optional[UUID], title: Optional[str],
                 content: Optional[str], type: Optional[str], job_position: Optional[str],
                 created_at: Optional[datetime]):
        self.id = id
        self.user_id = user_id
        self.resume_id = resume_id
        self.title = title
        self.content = content
        self.type = type
        self.job_position = job_position
        self.created_at = created_at



