from crewai import Agent
from langchain_community.chat_models import ChatOpenAI
from langchain_groq import ChatGroq

from backend.tools.BrowserTools import get_search_tool

class AgentService:
    @staticmethod
    def get_researcher(tier="free"):
        if tier == "free":
            return None

        researcher = Agent(
            role='Market Trends Researcher',
            goal='Scrape the web for  the top 5 high-demand keywords and certifications for {target_job}',
            tools=[get_search_tool()],
            llm=ChatGroq(model="llama3-70b-8192"),  # Cheap & Fast
            backstory='Expert at using Tavily to find hidden job requirements who knows exactly what recruiters are searching for in 2026.'
        )
        return researcher

    @staticmethod
    def get_analyst():
        return Agent(
            role='CV Analyst',
            goal='Compare the user resume against market standards and identify missing elements.',
            llm=ChatOpenAI(model="gpt-oss-120b"),
            backstory='A critical eye that spots weaknesses in experience descriptions and skill lists.',
        )

    @staticmethod
    def get_writer():
        return Agent(
            role='Executive Resume Writer',
            goal='Transform raw user data into a high-impact, grammatically perfect professional CV.',
            backstory='A top-tier career coach who specializes in ATS optimization and persuasive professional storytelling.',
            llm=ChatOpenAI(model="gpt-4o", temperature=0.7),
            verbose=True,
            allow_delegation=False
        )