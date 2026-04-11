from crewai import Task, Crew

from backend.schemas.ResumeSchema import ResumeCreate
from backend.services.AgentService import AgentService


class AIService:
    @staticmethod
    def run_cv_pipeline(resume_data, tier="free"):
        researcher, analyst = None, None
        writer = AgentService.get_writer()
        tasks = []

        if tier == "pro":
            researcher = AgentService.get_researcher(tier="pro")
            analyst = AgentService.get_analyst()

            if researcher is None or analyst is None or writer is None:
                raise RuntimeError("One or more AI agents could not be initialized.")

            research_task = Task(
                description=f"Research the most critical skills for a {resume_data.get('target_job_title')}",
                expected_output="Top 5 tech skills and 2 soft skills required for this job.", agent=researcher)
            tasks.append(research_task)

            # PRO TASK: Deep Pattern Analysis
            analysis_task = Task(
                description=f"Compare this resume: {resume_data} against the researched skills. Find gaps.",
                expected_output="Bullet points of missing skills or certifications found in the resume.", agent=analyst,
                context=[research_task])
            tasks.append(analysis_task)

            writing_task = Task(description="Rewrite the CV with full sentences, proper grammar and structure.",
                expected_output="JSON object of the polished resume.", agent=writer, context=[analysis_task],
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

        active_agents = [a for a in [researcher, analyst, writer] if a is not None]
        crew = Crew(agents=active_agents, tasks=tasks, verbose=True)
        return crew.kickoff()

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
        return {
            "target_job_title": raw_content.get("target_job_title"),
            "experiences": [
                {
                    "role": exp.get("role"),
                    "company_name": exp.get("company_name"),
                    "description": exp.get("description")
                } for exp in raw_content.get("experiences", [])
            ],
            "projects": [
                {
                    "project_name": proj.get("project_name"),
                    "description": proj.get("description")
                } for proj in raw_content.get("projects", [])
            ],
            "skills": [s.get("skill_name") for s in raw_content.get("skills", [])],
            "certifications": [c.get("certification_name") for c in raw_content.get("certifications", [])]
        }

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