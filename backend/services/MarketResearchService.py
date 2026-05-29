"""
MarketResearchService — resolves market "key skills" for a job title.

Read path: normalized lookup against market_insights_cache (keyed on the same
canonical search_query the cache is written with, so casing/whitespace in the
target job title don't cause a miss).

Write path: on a cache miss, run the CrewAI researcher agent to discover the
in-demand keywords for the role and persist them so the next request is a hit.
Running the agent is slow and costs tokens, so only the explicit "compute"
flows should call ensure_market_skills — read-only paths use cached_skills.
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Tuple

from crewai import Crew, Task
from supabase import Client

from backend.services.AgentService import AgentService
from backend.services.AIDataService import AIDataService

# A market keyword is a short skill name. Raw JSON/markdown punctuation in a
# stored "skill" means the agent output was never parsed and the cache is poisoned.
_SKILL_JUNK_CHARS = '{}[]":'


def _parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    """Best-effort: pull the first {...} JSON object out of an agent's text reply."""
    t = (text or "").strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*", "", t).rstrip("`").strip()
    start, end = t.find("{"), t.rfind("}")
    if start != -1 and end > start:
        try:
            parsed = json.loads(t[start : end + 1])
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None
    return None


def _coerce_to_dict(value: Any) -> Dict[str, Any]:
    """Turn a CrewAI result into a dict, parsing JSON from its raw text when needed."""
    if isinstance(value, dict):
        return value
    if hasattr(value, "json_dict") and getattr(value, "json_dict"):
        return value.json_dict
    if hasattr(value, "raw"):
        value = value.raw
    text = str(value or "")
    parsed = _parse_json_object(text)
    return parsed if parsed is not None else {"raw_text": text}


def _sanitize_skill(value: Any) -> str:
    return str(value).strip().strip(_SKILL_JUNK_CHARS + " '").strip()


def _looks_clean(skills: List[str]) -> bool:
    """True only if every entry looks like a real skill name (no JSON junk, not a sentence)."""
    if not skills:
        return False
    for s in skills:
        text = str(s)
        if any(c in text for c in _SKILL_JUNK_CHARS):
            return False
        if len(text) > 60:
            return False
    return True


class MarketResearchService:
    @staticmethod
    def search_query(job_title: str) -> str:
        return f"market_trends_{job_title.lower().strip().replace(' ', '_')}"

    @staticmethod
    def cached_record(db_client: Client, job_title: str) -> Optional[Dict[str, Any]]:
        """Return the cached market_insights row for this job title, or None.

        Never raises — a DB hiccup here (missing table, transient error) must not
        crash the caller; market keywords are an optional enrichment.
        """
        if not job_title:
            return None
        try:
            res = (
                db_client.table("market_insights_cache")
                .select("*")
                .eq("search_query", MarketResearchService.search_query(job_title))
                .limit(1)
                .execute()
            )
        except Exception as exc:
            print(f"[MarketResearch] cache lookup failed: {exc!r}")
            return None
        return res.data[0] if res.data else None

    @staticmethod
    def cached_skills(db_client: Client, job_title: str) -> List[str]:
        """Clean cached skills for the job title, or [].

        A row whose key_skills look poisoned (raw JSON fragments from an unparsed
        agent reply) is treated as a miss so ensure_market_skills re-researches and
        overwrites it instead of returning garbage forever.
        """
        record = MarketResearchService.cached_record(db_client, job_title)
        if not record:
            return []
        ks = record.get("key_skills") or []
        skills = [str(s) for s in ks if s] if isinstance(ks, list) else []
        return skills if _looks_clean(skills) else []

    @staticmethod
    def run_research(
        job_title: str, company_name: Optional[str] = None
    ) -> Tuple[List[str], Dict[str, Any]]:
        """Run the researcher agent for a job title. Returns (key_skills, raw_output).

        Returns ([], {}) if the agent can't be initialized; raises on agent run
        failure so callers can decide how to degrade.
        """
        researcher = AgentService.get_researcher()
        if researcher is None:
            return [], {}

        task = Task(
            description=(
                f"Research current resume and hiring standards for the role '{job_title}'. "
                "Return the most important hard skills, soft skills, certifications, ATS keywords, "
                "and 3 practical resume improvement tips."
            ),
            expected_output=(
                "Structured JSON-like summary with key_skills, certifications, ATS keywords, and resume tips."
            ),
            agent=researcher,
        )
        # The researcher's goal/backstory contain a {target_job_title} placeholder;
        # pass it as a kickoff input so CrewAI can interpolate it.
        result = Crew(agents=[researcher], tasks=[task], verbose=True).kickoff(
            inputs={"target_job_title": job_title}
        )
        result_dict = _coerce_to_dict(result)
        raw_skills = AIDataService.extract_market_skills(result_dict)
        key_skills = [s for s in (_sanitize_skill(x) for x in raw_skills) if s]
        return key_skills, result_dict

    @staticmethod
    def ensure_market_skills(
        db_client: Client, job_title: str, company_name: Optional[str] = None
    ) -> List[str]:
        """Return market key_skills for a job title, running + caching research on a miss.

        Degrades to [] on any failure so the caller can still produce output.
        """
        if not job_title:
            return []

        cached = MarketResearchService.cached_skills(db_client, job_title)
        if cached:
            return cached

        try:
            key_skills, raw = MarketResearchService.run_research(job_title, company_name)
        except Exception as exc:
            print(f"[MarketResearch] researcher agent run failed: {exc!r}")
            return []

        # Don't cache garbage. If the agent reply couldn't be parsed into clean
        # skills, degrade to "no keywords" rather than poisoning the cache.
        if not _looks_clean(key_skills):
            print(f"[MarketResearch] discarding unparseable research output for '{job_title}'")
            return []

        try:
            AIDataService.save_market_insights(
                db_client=db_client,
                job_title=job_title,
                key_skills=key_skills,
                raw_scraps=raw or {"source": "skill_matrix_research"},
                company_name=company_name,
            )
        except Exception as exc:
            print(f"[MarketResearch] could not persist market insights: {exc!r}")

        return key_skills
