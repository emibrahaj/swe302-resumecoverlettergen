class PDFGenerator:
    def __init__(self):
        self.template_path = "templates/resume_template.html"
        self.fonts_dir = "fonts"

    def map_json_to_html(self, data: dict, template_id: str):
        #injects the data into the html template
        pass

    def render_pdf(self, html_content: str):
        #uses puppeteer to render the html to a pdf
        pass

    def generate_preview_image(self, pdf_buffer):
        #generates a png preview image of the pdf
        pass

