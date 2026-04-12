from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

class TemplateService:

    @staticmethod
    def render_resume(content_dict: dict, template_name: str = "modern_professional.html") -> str:
        template = templates.get_template(template_name)
        html_content = template.render(data=content_dict)
        return html_content