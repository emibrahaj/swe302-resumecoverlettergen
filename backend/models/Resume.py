class Resume:
    def __init__(self, user_id, target_job_title=None, resume_id=None):
        self.resume_id = resume_id
        self.user_id = user_id
        self.target_job_title = target_job_title
        # Initialize lists for all sectors
        self.education = []
        self.experiences = []
        self.skills = []
        self.languages = []
        self.certifications = []
        self.trainings = []
        self.projects = []

    def to_dict(self):
        return {
            "education": [vars(e) for e in self.education],
            "experiences": [vars(ex) for ex in self.experiences],
            "skills": [vars(s) for s in self.skills],
            "languages": [vars(l) for l in self.languages],
            "certifications": [vars(c) for c in self.certifications],
            "trainings": [vars(t) for t in self.trainings],
            "projects": [vars(p) for p in self.projects]
        }

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