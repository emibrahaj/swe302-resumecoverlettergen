from typing import Optional
from uuid import UUID


class Course:
    def __init__(self, id: UUID, title: Optional[str] = None, skill_category: Optional[str] = None, affiliate_link: Optional[str] = None, discount_code: str = None):
        self.id = id
        self.title = title
        self.skill_category = skill_category
        self.discount_code = discount_code
        self.affiliate_link = affiliate_link