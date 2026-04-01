import crewai
from crewai import WriterAgent, AnalystAgent, ResearcherAgent, Agent


class AIOrchestrator:
    def __init__(self):
        self.model_name = "gpt-4o"
        self.crew = None
        self.agents = {}
        self.tasks = []

    def create_agents(self):
        self.agents['writer'] = Agent(role='CV Expert', goal='...', backstory='...')
        self.agents['analyst'] = Agent(role='Analyst', goal='...', backstory='...')
        self.agents['researcyer'] = Agent(role='Researcher', goal='...', backstory='...')

    def define_tasks(self, resume_data, job_requirements):
        #generates specific agent instructions based on the user's input
        pass

    def run_tailored_tasks(self, resume_id, target_job_id):
        #main entry point for the ai orchestrator
        pass

    def generate_feedback(self, resume_content):
        #generates feedback for the user instantly
        pass
