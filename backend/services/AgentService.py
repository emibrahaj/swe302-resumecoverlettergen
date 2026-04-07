from crewai import Agent

from backend.tools.BrowserTools import get_search_tool


model_id="groq/llama-3.3-70b-versatile"
class AgentService:
    @staticmethod
    def get_researcher(tier="free"):
        if tier == "free":
            return None

        return Agent(
            role='Market Trends Researcher',
            goal='Scrape the web for the top 5 high-demand keywords and certifications for {target_job_title}',
            tools=[get_search_tool()],
            llm=model_id,
            backstory='Expert at using Tavily to find hidden job requirements who knows exactly what recruiters are searching for in 2026.',
            verbose = True

        )

    @staticmethod
    def get_analyst():
        return Agent(
            role='CV Analyst',
            goal='Compare the user resume against market standards and identify missing elements.',
            llm=model_id,
            backstory='A critical eye that spots weaknesses in experience descriptions and skill lists.',
            verbose=True
        )

    @staticmethod
    def get_writer():
        return Agent(
            role='Executive Resume Writer',
            goal='Transform raw user data into a high-impact, grammatically perfect professional CV.',
            backstory='A top-tier career coach who specializes in ATS optimization and persuasive professional storytelling.',
            llm=model_id,
            verbose=True,
            allow_delegation=False
        )