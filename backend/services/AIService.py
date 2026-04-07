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

            research_task = Task(
                description=f"Research the most critical skills for a {resume_data['job_title']}",
                expected_output="Top 5 tech skills and 2 soft skills required for this job.",
                agent=researcher)
            tasks.append(research_task)

            # PRO TASK: Deep Pattern Analysis
            analysis_task = Task(
                description=f"Compare this resume: {resume_data} against the researched skills. Find gaps.",
                expected_output="Bullet points of missing skills or certifications found in the resume.",
                agent=analyst, context=[research_task])
            tasks.append(analysis_task)

            writing_task = Task(
                description="Rewrite the CV integrating the missing skills found by the analyst.",
                expected_output="JSON object of the polished resume.",
                agent=writer,
                context=[analysis_task],
                output_json=ResumeCreate
            )
            tasks.append(writing_task)

        else:
            writing_task = Task(
                description=(f"Rewrite this CV professionally: {resume_data}. "
                             "Use STAR method for bullets. Keep JSON keys identical."),
                expected_output="A JSON object containing all sections polished.",
                agent=writer,
                output_json=ResumeCreate
            )
            tasks.append(writing_task)

        active_agents = [a for a in [researcher, analyst, writer] if a is not None]
        crew = Crew(agents=active_agents, tasks=tasks)
        return crew.kickoff()