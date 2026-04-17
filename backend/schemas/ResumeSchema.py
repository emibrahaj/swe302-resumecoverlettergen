import uuid
from typing import List, Optional

from pydantic import BaseModel

from backend.models.Resume import Education, Experience, Resume, Certification, Language, Skill, Training, Project


class EducationIn(BaseModel):
    education_id: Optional[str] = None
    university: str
    degree: str
    start_date: str
    end_date: str


class ExperienceIn(BaseModel):
    experience_id: Optional[str] = None
    company_name: str
    role: str
    start_date: str
    end_date: str
    is_current: bool = False
    description: str


class SkillIn(BaseModel):
    skill_id: Optional[str] = None
    skill_name: str
    proficiency: str


class CertificationIn(BaseModel):
    certification_id: Optional[str] = None
    certification_name: str
    date_obtained: str
    company_name: str


class TrainingIn(BaseModel):
    training_id: Optional[str] = None
    training_name: str
    start_date: str
    date_obtained: str
    company_name: str


class LanguageIn(BaseModel):
    language_id: Optional[str] = None
    language_name: str
    proficiency: str


class ProjectIn(BaseModel):
    project_id: Optional[str] = None
    project_name: str
    description: str
    start_date: str
    end_date: str
    link: str


class ResumeCreate(BaseModel):
    user_id: Optional[str] = None
    full_name: str
    target_job_title: Optional[str] = ""
    education: List[EducationIn]
    experiences: List[ExperienceIn]
    skills: List[SkillIn]
    languages: List[LanguageIn]
    certifications: List[CertificationIn]
    trainings: List[TrainingIn]
    projects: List[ProjectIn]
    profile_picture: Optional[str] = None

    def to_model(self) -> Resume:
        model = Resume(user_id=self.user_id, target_job_title=self.target_job_title)

        model.education = [
            Education(education_id=e.education_id or str(uuid.uuid4()), **e.model_dump(exclude={"education_id"}))
            for e in self.education
        ]

        model.experiences = [
            Experience(experience_id=e.experience_id or str(uuid.uuid4()), **e.model_dump(exclude={"experience_id"}))
            for e in self.experiences
        ]

        model.skills = [
            Skill(skill_id=e.skill_id or str(uuid.uuid4()), **e.model_dump(exclude={"skill_id"}))
            for e in self.skills
        ]

        model.languages = [
            Language(language_id=e.language_id or str(uuid.uuid4()), **e.model_dump(exclude={"language_id"}))
            for e in self.languages
        ]

        model.certifications = [
            Certification(
                certification_id=e.certification_id or str(uuid.uuid4()),
                **e.model_dump(exclude={"certification_id"})
            )
            for e in self.certifications
        ]

        model.trainings = [
            Training(training_id=e.training_id or str(uuid.uuid4()), **e.model_dump(exclude={"training_id"}))
            for e in self.trainings
        ]

        model.projects = [
            Project(project_id=e.project_id or str(uuid.uuid4()), **e.model_dump(exclude={"project_id"}))
            for e in self.projects
        ]
        return model
