from pydantic import BaseModel, HttpUrl
from typing import List, Optional

from backend.models.Resume import Resume, Certification, Language, Skill, Training, Project
from backend.models.Resume import Education, Experience


class EducationIn(BaseModel):
    university: str
    degree: str
    date_started: str
    date_ended: str

class ExperienceIn(BaseModel):
    company_name: str
    role: str
    description: str

class SkillIn(BaseModel):
    skill_name: str
    proficiency: str # e.g., "Advanced", "Intermediate"

class LanguageIn(BaseModel):
    language_name: str
    proficiency: str

class CertificationIn(BaseModel):
    certification_name: str
    date_obtained: str
    company_name: str

class TrainingIn(BaseModel):
    training_name: str
    start_date: str
    date_obtained: str
    company_name: str

class ProjectIn(BaseModel):
    project_name: str
    description: str
    start_date: str
    end_date: str
    link: str

class ResumeCreate(BaseModel):
    user_id: str
    full_name: str
    target_job_title: Optional[str] = ""
    education: List[EducationIn]
    experiences: List[ExperienceIn]
    skills: List[SkillIn]
    languages: List[LanguageIn]
    certifications: List[CertificationIn]
    trainings: List[TrainingIn]
    profile_picture: Optional[HttpUrl] = None

    def to_model(self) -> Resume:
        model = Resume(user_id=self.user_id, target_job_title=self.target_job_title)

        model.education = [Education(None, **e.model_dump()) for e in self.education]

        model.experiences = [
            Experience(None, e.company_name, e.role, None, None, False, e.description)
            for e in self.experiences
        ]
        model.certifications = [Certification(**e.model_dump()) for e in self.certifications]
        model.languages = [Language(**e.model_dump()) for e in self.languages]
        model.skills = [Skill(**e.model_dump()) for e in self.skills]
        model.trainings = [Training(**e.model_dump()) for e in self.trainings]
        model.projects = [Project(**e.model_dump()) for e in self.projects]
        return model