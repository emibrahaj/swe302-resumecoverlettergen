from fastapi.templating import Jinja2Templates
from supabase import Client

templates = Jinja2Templates(directory="templates")

class TemplateService:

    @staticmethod
    def list_templates(db_client: Client):
        response = db_client.table("templates").select("*").execute()
        return response.data

    @staticmethod
    def render_resume(db_client: Client, content_dict: dict, template_id: str = None):
        template_file = "modern_professional.html"

        if template_id:
            res = db_client.table("templates").select("file_path").eq("id", template_id).single().execute()
            if res.data and res.data.get("file_path"):
                template_file = res.data["file_path"]
        try:
            template = templates.get_template(template_file)
            return template.render(data=content_dict)
        except Exception as e:
            print(f"Rendering error: {e}. Falling back to default.")
            # safety fallback
            return templates.get_template("modern_professional.html").render(data=content_dict)


