from crewai import Agent, LLM
from backend.tools.BrowserTools import get_search_tool
from backend.services._prompts import HUMAN_VOICE_RULES

model_id = "groq/llama-3.3-70b-versatile"

# Resume writing uses a slightly lower temperature so output stays grounded and
# avoids the model's default flowery prose.
_writer_llm = LLM(model=model_id, temperature=0.5)


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
            role="Honest Resume Writer",
            goal=(
                "Rewrite work experiences and project descriptions so they sound like a real "
                "person describing their own work — concrete, specific, modest. Polish the "
                "phrasing only. Never change IDs, company names, university names, dates, or "
                "metrics. Never invent details that aren't in the user's input.\n\n"
                + HUMAN_VOICE_RULES
            ),
            backstory=(
                "A career coach who has read 10,000 resumes and is allergic to corporate "
                "jargon. You write the way a senior engineer or analyst would describe their "
                "own work to a friend on Tuesday afternoon — short sentences, plain words, "
                "active voice, modest claims. You'd rather under-sell than over-claim."
            ),
            llm=_writer_llm,
            verbose=True,
            allow_delegation=False,
        )

    @staticmethod
    def get_cover_letter_writer():
        return Agent(
            role="Honest Cover Letter Writer",
            goal=(
                "Write a cover letter that sounds like a real candidate, not a chatbot. "
                "Plain language. Specific examples from the user's resume. No corporate "
                "filler.\n\n" + HUMAN_VOICE_RULES
            ),
            backstory=(
                "You've coached hundreds of job seekers. You write cover letters the way you "
                "talk in a coffee chat — direct, specific, no jargon. You'd rather say 'I "
                "worked on the payments team for two years' than 'I leveraged my expertise "
                "to deliver world-class outcomes in the financial services vertical.'"
            ),
            llm=_writer_llm,
            verbose=True,
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

    @staticmethod
    def get_user_info_agent():
        return Agent(
            role="Resume Intake Specialist",
            goal=(
                "Validate and normalize the user-supplied resume JSON. "
                "Flag missing critical fields (full_name, target_job_title, at least 1 experience or project). "
                "NEVER invent data; only label gaps. Output the same JSON plus a 'validation' object describing gaps "
                "and a confidence score 0-100."
            ),
            backstory="A meticulous HR data analyst who treats every missing field as a risk to the candidate's chances.",
            llm=model_id,
            verbose=True,
            allow_delegation=False,
        )

    @staticmethod
    def get_template_analyst():
        return Agent(
            role="Template Layout Analyst",
            goal=(
                "Given a deterministic template spec (sections, placeholders, character budgets) and the user's "
                "resume data, produce a fitting plan: for each section recommend a word count, tone, and which "
                "placeholders are mandatory vs optional. Output JSON only — never prose."
            ),
            backstory="A typographer who has laid out 10,000 resumes and knows how much text fits each section.",
            llm=model_id,
            verbose=True,
            allow_delegation=False,
        )

    @staticmethod
    def get_text_fitting_agent():
        return Agent(
            role="Layout Conformance Editor",
            goal=(
                "Verify every text field in the resume JSON fits the budgets from the fitting plan. "
                "Shorten any bullets that overflow without losing meaning. Lightly expand bullets that "
                "fall below 60% of their budget — but only with information already in the bullet, "
                "never invented. Output ONLY the corrected resume JSON — same shape as input, no "
                "commentary.\n\n" + HUMAN_VOICE_RULES
            ),
            backstory=(
                "A copy editor who has rescued thousands of resumes from awkward overflow. You trim "
                "filler words and corporate jargon first, real content last. You never invent new "
                "details to pad a short bullet."
            ),
            llm=_writer_llm,
            verbose=True,
            allow_delegation=False,
        )