from pathlib import Path
from typing import Any, Dict, Optional

from jinja2 import Environment, FileSystemLoader, TemplateNotFound, select_autoescape
from supabase import Client

TEMPLATES_DIR = Path(__file__).resolve().parents[1] / "templates"
DEFAULT_TEMPLATE_FILE = "template2.html"
MAX_NUMERIC_TEMPLATE = 12

_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def _resolve_template_file(db_client: Optional[Client], template_id: Optional[str]) -> str:
    if template_id is None:
        return DEFAULT_TEMPLATE_FILE
    try:
        n = int(str(template_id))
        if 2 <= n <= MAX_NUMERIC_TEMPLATE:
            return f"template{n}.html"
    except (TypeError, ValueError):
        pass
    if db_client is not None:
        try:
            row = (
                db_client.table("templates")
                .select("style_config")
                .eq("id", str(template_id))
                .limit(1)
                .execute()
            )
            if row.data:
                style_config = row.data[0].get("style_config") or {}
                file_hint = style_config.get("file") or style_config.get("template_file")
                if isinstance(file_hint, str) and file_hint.startswith("template_"):
                    return file_hint
        except Exception:
            pass
    return DEFAULT_TEMPLATE_FILE


class TemplateService:
    @staticmethod
    def list_templates(db_client: Client):
        response = db_client.table("templates").select("*").execute()
        return response.data

    @staticmethod
    def render_resume(
        db_client: Optional[Client],
        content_dict: Dict[str, Any],
        template_id: Optional[str] = None,
    ) -> str:
        template_file = _resolve_template_file(db_client, template_id)
        try:
            template = _env.get_template(template_file)
        except TemplateNotFound:
            template = _env.get_template(DEFAULT_TEMPLATE_FILE)
        return template.render(resume=content_dict or {})