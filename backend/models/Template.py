import datetime
from typing import Optional, Any, Dict
from uuid import UUID


class Template:
    def __init__(self, id: UUID, name: str, type: str, preview_image_url: Optional[str], style_config: Dict[str, Any], is_premium: bool = False, created_at: Optional[datetime] = None):
        self.id = id
        self.name = name
        self.type = type
        self.preview_image_url = preview_image_url
        self.style_config = style_config
        self.is_premium = is_premium
        self.created_at = created_at