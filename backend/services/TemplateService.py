from html import escape
from supabase import Client


class TemplateService:
    @staticmethod
    def list_templates(db_client: Client):
        response = db_client.table("templates").select("*").execute()
        return response.data

    @staticmethod
    def render_resume(db_client: Client, content_dict: dict, template_id: str = None):
        # The actual DB schema stores templates as style_config/preview_image_url, not file_path.
        # Until frontend/backend template rendering is fully integrated, render a safe basic HTML resume.
        content = content_dict or {}
        full_name = content.get("full_name") or content.get("name") or "Resume"
        target = content.get("target_job_title") or content.get("title") or ""

        def list_section(title, items):
            if not items:
                return ""
            html_items = []
            for item in items:
                if isinstance(item, dict):
                    text = " - ".join(str(v) for v in item.values() if v not in (None, ""))
                else:
                    text = str(item)
                html_items.append(f"<li>{escape(text)}</li>")
            return f"<section><h2>{escape(title)}</h2><ul>{''.join(html_items)}</ul></section>"

        body = "".join([
            list_section("Skills", content.get("skills", [])),
            list_section("Experience", content.get("experiences", content.get("experience", []))),
            list_section("Education", content.get("education", [])),
            list_section("Projects", content.get("projects", [])),
            list_section("Certifications", content.get("certifications", [])),
            list_section("Languages", content.get("languages", [])),
        ])

        return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {{ font-family: Arial, sans-serif; margin: 40px; color: #111827; }}
    h1 {{ color: #088395; margin-bottom: 4px; }}
    h2 {{ color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 24px; }}
    ul {{ padding-left: 20px; }}
    li {{ margin-bottom: 6px; }}
    .target {{ color: #6b7280; margin-bottom: 24px; }}
  </style>
</head>
<body>
  <h1>{escape(str(full_name))}</h1>
  <div class="target">{escape(str(target))}</div>
  {body}
</body>
</html>"""
