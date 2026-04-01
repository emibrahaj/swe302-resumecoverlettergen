'''According to the resume in the document '''

class Resume:

    def __init__(self, resume_id, user_id):
        self.resume_id = resume_id
        self.user_id = user_id
        self.education = []
        self.experiences = []
        self.skills = []
        self.projects = []

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
        #self.start_date = start_date
        #self.end_date = end_date
        #self.is_current = is_current
        self.description = description


class Skill:
    def __init__(self, skills_id, skill_name, prog_language, proficiency):
        # e.g, python, java
        self.skills_id = skills_id
        self.skill_name = skill_name
        self.prog_language = prog_language
        self.proficiency = proficiency

