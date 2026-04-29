from crewai import Task, Crew

from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.AgentService import AgentService


class AIService:
    @staticmethod
    def run_cv_pipeline(resume_data, tier="free"):
        writer = AgentService.get_writer()
        tasks = []
        agents = [writer]

        if tier == "pro":
            researcher = AgentService.get_researcher()
            coach = AgentService.get_career_coach()
            analyst = AgentService.get_analyst()
            agents.extend([researcher, analyst, coach])

            if researcher is None or analyst is None or writer is None:
                raise RuntimeError("One or more AI agents could not be initialized.")

            # task 1: market research
            research_task = Task(
                description=f"Research the most critical skills for a {resume_data.get('target_job_title')}",
                expected_output="Top 5 tech skills and 2 soft skills required for this job.", agent=researcher)
            tasks.append(research_task)

            # task 2: analysis
            analysis_task = Task(
                description=f"Compare this resume: {resume_data} against the researched skills. Find gaps.",
                expected_output="Bullet points of missing skills or certifications found in the resume.", agent=analyst,
                context=[research_task])
            tasks.append(analysis_task)

            # task 3: strategic advice
            coaching_task = Task(
                description="Based on market research and this resume, suggest 3 courses or certifications to fill gaps.",
                expected_output="A bulleted list of 3 specific learning recommendations.", agent=coach,
                context=[research_task, analysis_task])
            tasks.append(coaching_task)

            writing_task = Task(
                description="Rewrite the CV with full sentences, proper grammar and structure. Use STAR method.",
                expected_output="JSON object of the polished resume.", agent=writer, context=[research_task, analysis_task],
                output_json=ResumeCreate)
            tasks.append(writing_task)

        else:
            if writer is None:
                raise RuntimeError("Writer agent could not be initialized.")

            writing_task = Task(description=(f"Rewrite this CV professionally: {resume_data}. "
                                             "Use STAR method for bullets. Keep JSON keys identical."),
                                expected_output="A JSON object containing all sections polished.", agent=writer,
                                output_json=ResumeCreate)
            tasks.append(writing_task)

        crew = Crew(agents=agents, tasks=tasks, verbose=True)
        return crew.kickoff()

    @staticmethod
    def run_cover_letter_pipeline(user_data: str, job_position: str, resume_context: str = None):
        writer = AgentService.get_cover_letter_writer()
        if writer is None:
            raise RuntimeError("Writer agent could not be initialized.")

        description = f"Write a cover letter for {job_position}."
        if resume_context:
            description += f" Use this resume for background information: {resume_context}."
        else:
            description += f" Use this individual input for background information: {user_data}."

        task = Task(description=description, expected_output="A professional cover letter in markdown format.",
            agent=writer, )
        crew = Crew(agents=[writer], tasks=[task], verbose=True)
        return str(crew.kickoff())

    @staticmethod
    def run_writer_agent(resume_data, market_insights):
        writer = AgentService.get_writer()
        writing_task = Task(description=f"Rewrite the resume based on these pre-researched insights: {market_insights}"
                                        "Do not invent anything. Do not touch IDs. Do not change dates.",
                            expected_output="The final polished resume JSON.", agent=writer)

        crew = Crew(agents=[writer], tasks=[writing_task], verbose=True)
        return crew.kickoff(inputs={"resume": resume_data})

    @staticmethod
    def prepare_ai_payload(raw_content: dict) -> dict:
        return {"target_job_title": raw_content.get("target_job_title"), "experiences": [
            {"role": exp.get("role"), "company_name": exp.get("company_name"), "description": exp.get("description")}
            for exp in raw_content.get("experiences", [])],
                "projects": [{"project_name": proj.get("project_name"), "description": proj.get("description")} for proj
                             in raw_content.get("projects", [])],
                "skills": [s.get("skill_name") for s in raw_content.get("skills", [])],
                "certifications": [c.get("certification_name") for c in raw_content.get("certifications", [])]}

    @staticmethod
    def merge_polished_data(original_raw: dict, ai_polished: dict) -> dict:
        import copy
        final_resume = copy.deepcopy(original_raw)

        for i, exp in enumerate(final_resume.get("experiences", [])):
            if i < len(ai_polished.get("experiences", [])):
                ai_exp = ai_polished["experiences"][i]
                exp["description"] = ai_exp.get("description", exp["description"])
                exp["role"] = ai_exp.get("role", exp["role"])

        for i, proj in enumerate(final_resume.get("projects", [])):
            if i < len(ai_polished.get("projects", [])):
                ai_proj = ai_polished["projects"][i]
                proj["description"] = ai_proj.get("description", proj["description"])
                proj["project_name"] = ai_proj.get("project_name", proj["project_name"])

        if "skills" in ai_polished and isinstance(ai_polished["skills"], list):
            for i, skill in enumerate(final_resume.get("skills", [])):
                if i < len(ai_polished["skills"]):
                    if isinstance(ai_polished["skills"][i], str):
                        skill["skill_name"] = ai_polished["skills"][i]
                    elif isinstance(ai_polished["skills"][i], dict):
                        skill["skill_name"] = ai_polished["skills"][i].get("skill_name", skill["skill_name"])

        return final_resume

    @staticmethod
    def expand_work_bullet(short_phrase: str):
        agent = AgentService.get_writer()
        task = Task(description=f"Expand this into an impactful STAR bullet point: '{short_phrase}'",
                    expected_output="A single professional bullet point.", agent=agent)
        crew = Crew(agents=[agent], tasks=[task], verbose=True)
        return str(crew.kickoff())
