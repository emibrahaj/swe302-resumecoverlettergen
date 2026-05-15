from pathlib import Path
from playwright.async_api import async_playwright


TEMPLATE_MAP = {
    "template3": "template3.html",
    "template4": "template4.html",
    "template5": "template5.html",
    "template6": "template6.html",
    "template7": "template7.html",
    "template8": "template8.html",
    "template9": "template9.html",
    "template10": "template10.html",
    "template11": "template11.html",
    "template12": "template12.html",
}


class PDFService:
    def __init__(self):
        self.templates_dir = Path("templates")

    def get_template_path(self, template_key: str) -> Path:
        """
        Gets correct HTML file based on template key
        """

        html_file = TEMPLATE_MAP.get(template_key)

        if not html_file:
            raise ValueError(f"Unknown template: {template_key}")

        template_path = self.templates_dir / html_file

        if not template_path.exists():
            raise FileNotFoundError(
                f"Template not found: {template_path}"
            )

        return template_path

    async def load_template(self, template_key: str) -> str:
        """
        Loads HTML template content
        """

        template_path = self.get_template_path(template_key)

        with open(template_path, "r", encoding="utf-8") as file:
            return file.read()

    @staticmethod
    async def generate_pdf(html_content: str, output_path: str):
        """
        Generates PDF from rendered HTML
        """

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            page = await browser.new_page()

            await page.set_content(
                html_content,
                wait_until="networkidle"
            )

            await page.emulate_media(media="print")

            await page.pdf(
                path=output_path,
                format="A4",
                print_background=True,
                margin={
                    "top": "0px",
                    "bottom": "0px",
                    "left": "0px",
                    "right": "0px"
                }
            )

            await browser.close()