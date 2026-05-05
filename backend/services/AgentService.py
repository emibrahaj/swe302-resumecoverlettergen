from crewai import Agent
from backend.tools.BrowserTools import get_search_tool

model_id = "groq/llama-3.3-70b-versatile"


class AgentService:
    @staticmethod
    def get_researcher():
        return Agent(
            role="Market Trends Researcher",
            goal="Scrape the web for the top 5 high-demand keywords and certifications for {target_job_title}",
            tools=[get_search_tool()],
            llm=model_id,
            backstory="Expert at finding 2026 market requirements using Tavily.",
            verbose=True
        )

    @staticmethod
    def get_writer():
        return Agent(
            role="Executive Resume Writer",
            goal="Your task is ONLY to improve the professional phrasing of the provided work experiences and project descriptions. "
                 "DO NOT change the IDs."
                 "DO NOT change the names of companies or universities."
                 "DO NOT invent anything new, go based off the information you have.",
            backstory="A top-tier career coach who specializes in ATS optimization and persuasive professional storytelling.",
            llm=model_id,
            verbose=True,
            allow_delegation=False
        )

    @staticmethod
    def get_cover_letter_writer():
        return Agent(
            role="Persuasive Copywriter",
            goal="Generate a compelling cover letter that bridges a user's specific skills to a job position.",
            backstory="A specialist in executive storytelling who knows how to make candidates stand out.",
            llm=model_id,
            verbose=True,
            allow_delegation=False
        )

    @staticmethod
    def get_analyst():
        return Agent(
            role="CV Analyst",
            goal="Compare the user resume against market standards and identify missing elements.",
            llm=model_id,
            backstory="A critical eye that spots weaknesses in experience descriptions and skill lists.",
            verbose=True
        )

    @staticmethod
    def get_career_coach():
        return Agent(
            role='AI Career Strategist',
            goal='Identify skill gaps and suggest specific high-value certifications or courses.',
            backstory='Strategic advisor who helps users level up their market value.',
            llm=model_id,
            verbose=True
        )