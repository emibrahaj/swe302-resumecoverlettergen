from typing import Optional
from uuid import UUID


class Course:
    def __init__(self, id: UUID, title: Optional[str] = None, skill_category: Optional[str] = None, affiliate_link: Optional[str] = None, discount_code: str = None):
        self.id = id
        self.title = title
        self.skill_category = skill_category
        self.affiliate_link = affiliate_link
        self.discount_code = discount_code

class CourseUsage:
    def __init__(self, id: UUID, course_id: UUID, user_id: UUID, created_at: Optional[str] = None):
        self.id = id
        self.user_id = user_id
        self.course_id = course_id
        self.created_at = created_at