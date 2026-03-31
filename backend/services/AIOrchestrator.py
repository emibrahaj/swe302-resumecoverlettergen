import crewai
from crewai import WriterAgent, AnalystAgent, ResearcherAgent

class AIOrchestrator:
    def __init__(self):
        self.model_name = "gpt-4o"
        self.crew = crewai.Crew()
        self.agents = {"Writer" : self.crew.add(WriterAgent(model=self.model_name)),
                       "Analyst" : self.crew.add(AnalystAgent(model=self.model_name)),
                       "Researcher:" : self.crew.add(ResearcherAgent(model=self.model_name))}

    def create_agents(self):
        #defines the agents that will be used in the crew
        pass

    def define_tasks(self, resume_data, job_requirements):
        #generates specific agent instructions based on the user's input
        pass

    def run_tailored_tasks(self, resume_id, target_job_id):
        #main entry point for the ai orchestrator
        pass

    def generate_feedback(self, resume_content):
        #generates feedback for the user instantly
        pass
