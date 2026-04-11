import datetime
from typing import Optional
from uuid import UUID

class Embedding:
    def __init__(self, id: UUID, entity_type: Optional[str], entity_id: Optional[UUID], vector: list[float], created_at: Optional[datetime] = None):
        self.id = id
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.vector = vector
        self.created_at = created_at