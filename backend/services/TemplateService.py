import re
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


def _as_list(value: Any) -> list:
    if isinstance(value, list):
        return value
    return [] if value in (None, "") else [value]


def _s(value: Any) -> str:
    return "" if value is None else str(value)


def _bullets(desc: Any) -> list[str]:
    if not desc:
        return []
    return [line.strip() for line in str(desc).split("\n") if line.strip()]


def _skill_names(skills: Any) -> list[str]:
    names: list[str] = []
    for s in _as_list(skills):
        if isinstance(s, str):
            if s.strip():
                names.append(s.strip())
        elif isinstance(s, dict):
            name = s.get("skill_name") or s.get("name") or ""
            if name:
                names.append(str(name))
    return names


def _to_template_resume(content: Dict[str, Any]) -> Dict[str, Any]:
    """Reshape the stored resume (flat raw_content / polished_content keys) into the
    nested structure the Jinja templates expect: resume.personalInfo.*, .summary,
    .experience[], .education[], .skills[], .projects[], .links[], .certifications[],
    .languages[], etc.

    The Jinja fallback renderer is what runs in production when the headless React
    preview isn't reachable. The templates iterate over and chain-access these keys,
    so EVERY iterated key must be present as a list (else Jinja raises
    "'dict object' has no attribute ..."). This builder guarantees that shape.
    """
    c = content or {}
    pi = c.get("personal_info") if isinstance(c.get("personal_info"), dict) else {}

    def g(*keys: str) -> str:
        for k in keys:
            v = c.get(k)
            if v not in (None, ""):
                return str(v)
            v = pi.get(k)
            if v not in (None, ""):
                return str(v)
        return ""

    links = [
        {
            "platform": _s(l.get("platform") or l.get("label") or l.get("name")),
            "url": _s(l.get("url") or l.get("link")),
        }
        for l in (_as_list(c.get("links")) or _as_list(c.get("profiles")))
        if isinstance(l, dict)
    ]

    skill_names = _skill_names(c.get("skills"))

    return {
        "personalInfo": {
            "fullName": g("full_name", "fullName"),
            "jobTitle": g("target_job_title", "title", "jobTitle"),
            "email": g("email"),
            "phone": g("phone"),
            "location": g("address", "location"),
            "website": g("website"),
            "github": g("github"),
            "linkedin": g("linkedin"),
            "photoUrl": g("photo_url", "photoUrl", "avatar_url"),
            "links": links,
        },
        "summary": g("about", "summary"),
        "skills": (
            [{"category": "Skills", "level": "", "items": ", ".join(skill_names)}]
            if skill_names
            else []
        ),
        "experience": [
            {
                "company": _s(e.get("company_name") or e.get("company")),
                "position": _s(e.get("role") or e.get("job_title") or e.get("title")),
                "location": _s(e.get("location")),
                "website": _s(e.get("website")),
                "startDate": _s(e.get("start_date") or e.get("startDate")),
                "endDate": _s(e.get("end_date") or e.get("endDate")),
                "description": _s(e.get("description")),
                "bullets": _bullets(e.get("description")),
            }
            for e in _as_list(c.get("experiences"))
            if isinstance(e, dict)
        ],
        "education": [
            {
                "school": _s(e.get("university") or e.get("school")),
                "degree": _s(e.get("degree")),
                "location": _s(e.get("location")),
                "startDate": _s(e.get("start_date") or e.get("startDate")),
                "endDate": _s(e.get("end_date") or e.get("end_year") or e.get("year")),
                "description": _s(e.get("description")),
            }
            for e in _as_list(c.get("education"))
            if isinstance(e, dict)
        ],
        "projects": [
            {
                "title": _s(p.get("project_name") or p.get("name")),
                "role": _s(p.get("role")),
                "description": _s(p.get("description")),
                "startDate": _s(p.get("start_date") or p.get("startDate")),
                "endDate": _s(p.get("end_date") or p.get("endDate")),
                "link": _s(p.get("link")),
            }
            for p in _as_list(c.get("projects"))
            if isinstance(p, dict)
        ],
        "certifications": [
            {
                "title": _s(ct.get("certification_name") or ct.get("name") or ct.get("title")),
                "name": _s(ct.get("certification_name") or ct.get("name")),
                "provider": _s(ct.get("issuer") or ct.get("company_name") or ct.get("provider")),
                "date": _s(ct.get("date_obtained") or ct.get("date")),
            }
            for ct in _as_list(c.get("certifications"))
            if isinstance(ct, dict)
        ],
        "languages": [
            {
                "name": _s(lg.get("language_name") or lg.get("name") or lg.get("language")),
                "language": _s(lg.get("language_name") or lg.get("name") or lg.get("language")),
                "language_name": _s(lg.get("language_name") or lg.get("name") or lg.get("language")),
                "level": _s(lg.get("proficiency") or lg.get("level")),
                "proficiency": _s(lg.get("proficiency") or lg.get("level")),
            }
            for lg in _as_list(c.get("languages"))
            if isinstance(lg, dict)
        ],
        "profiles": links,
        "links": links,
        "awards": [],
        "interests": [],
    }


def _file_from_key(key: Any) -> Optional[str]:
    """Map a renderer key to a template file: 'template4' / 'template_4' / '4' -> template4.html."""
    if key in (None, ""):
        return None
    m = re.match(r"^template[_-]?(\d+)$", str(key).strip())
    if m:
        n = int(m.group(1))
        if 2 <= n <= MAX_NUMERIC_TEMPLATE:
            return f"template{n}.html"
    try:
        n = int(str(key).strip())
        if 2 <= n <= MAX_NUMERIC_TEMPLATE:
            return f"template{n}.html"
    except (TypeError, ValueError):
        pass
    return None


def _resolve_template_file(db_client: Optional[Client], template_id: Optional[str]) -> str:
    if not template_id:
        return DEFAULT_TEMPLATE_FILE

    # Direct renderer key/number ("template4", "4").
    direct = _file_from_key(template_id)
    if direct:
        return direct

    # Slug / template_key / uuid -> resolve via the DB template's
    # style_config.templateKey (e.g. "programming" -> "template4"), mirroring how
    # the frontend picks the renderer.
    if db_client is not None:
        for column in ("template_key", "id"):
            try:
                row = (
                    db_client.table("templates")
                    .select("style_config, template_key, id")
                    .eq(column, str(template_id))
                    .limit(1)
                    .execute()
                )
            except Exception:
                continue
            if row.data:
                sc = row.data[0].get("style_config") or {}
                resolved = _file_from_key(
                    sc.get("templateKey") or sc.get("file") or row.data[0].get("template_key")
                )
                if resolved:
                    return resolved
                break
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
        # Reshape the flat stored content into the nested structure the templates
        # expect; otherwise Jinja raises "'dict object' has no attribute 'personalInfo'".
        return template.render(resume=_to_template_resume(content_dict))