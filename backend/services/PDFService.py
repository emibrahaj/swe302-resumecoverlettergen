from playwright.async_api import async_playwright

class PDFService:
    def __init__(self):
        self.template_path = "templates/modern_professional.html"
        self.fonts_dir = "fonts"

    @staticmethod
    async def generate_pdf(html_content: str, output_path: str):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            await page.set_content(html_content, wait_until="networkidle")
            await page.emulate_media(media="print")
            await page.pdf(path=output_path, format="A4", print_background=True,
                           margin={"top": "0px", "bottom": "0px", "left": "0px", "right": "0px"})

            await browser.close()
