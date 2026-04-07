from crewai import Agent

from backend.tools.BrowserTools import get_search_tool


class AgentService:
    @staticmethod
    def get_researcher(tier="free"):
        if tier == "free":
            return None

        return Agent(
            role='Market Trends Researcher',
            goal='Scrape the web for the top 5 high-demand keywords and certifications for {target_job_title}',
            tools=[get_search_tool()],
            llm="groq/llama3-70b-8192",
            backstory='Expert at using Tavily to find hidden job requirements who knows exactly what recruiters are searching for in 2026.'
        )

    @staticmethod
    def get_analyst():
        return Agent(
            role='CV Analyst',
            goal='Compare the user resume against market standards and identify missing elements.',
            llm="groq/llama3-70b-8192",
            backstory='A critical eye that spots weaknesses in experience descriptions and skill lists.',
        )

    @staticmethod
    def get_writer():
        return Agent(
            role='Executive Resume Writer',
            goal='Transform raw user data into a high-impact, grammatically perfect professional CV.',
            backstory='A top-tier career coach who specializes in ATS optimization and persuasive professional storytelling.',
            llm="groq/llama3-70b-8192",
            verbose=True,
            allow_delegation=False
        )