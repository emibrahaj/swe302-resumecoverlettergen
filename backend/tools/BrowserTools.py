from crewai.tools import BaseTool
from tavily import TavilyClient
import os

class TavilySearchTool(BaseTool):
    name: str = "Web Search Tool"
    description: str = "Search the web for job trends, skills, and certifications."

    def _run(self, query: str):
        client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
        response = client.search(query=query, max_results=5)

        return response


def get_search_tool():
    """Is used as a tool for the AI agents to scour the web live."""
    return TavilySearchTool()