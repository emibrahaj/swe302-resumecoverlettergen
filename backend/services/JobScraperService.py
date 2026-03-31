class JobScraperService:
    def __init__(self):
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        self.proxy = None

    def scrape_url(self, url: str):
        #fetches the html content of a url
        pass

    def extract_text(self, html: str):
        #cleans the html to get only relevant text
        pass

    def summarize_requirements(self, raw_text: str):
        #generates a summary of the job requirements
        pass

    def cache_job_data(self, job_title: str, job_data: dict):
        #saves the job data to the db for future reference
        pass