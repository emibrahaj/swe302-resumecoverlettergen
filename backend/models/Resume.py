'''According to the resume in the document '''

class Resume:
    def __init__(self, user_id, target_job_title=None, resume_id=None):
        self.resume_id = resume_id
        self.user_id = user_id
        self.target_job_title = target_job_title
        self.education = []   # List of Education objects
        self.experiences = [] # List of Experience objects
        self.skills = []      # List of Skill objects

    def to_dict(self):
        #Converts the entire resume object into a JSON-compatible dictionary.
        return {
            "education": [vars(e) for e in self.education],
            "experiences": [vars(ex) for ex in self.experiences],
            "skills": [vars(s) for s in self.skills]
        }

class Education:
    def __init__(self, education_id, university, degree, date_started, date_ended):
        self.education_id = education_id
        self.university = university
        self.degree = degree
        self.date_started = date_started
        self.date_ended = date_ended

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
    def __init__(self, skills_id, skill_name, proficiency):
        self.skills_id = skills_id
        self.skill_name = skill_name
        self.proficiency = proficiency

