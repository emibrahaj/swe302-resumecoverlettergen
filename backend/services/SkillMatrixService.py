"""
SkillMatrixService — scores a resume across 8 dimensions plus an overall weighted score.

Mix of deterministic Python (for measurable signals) and a single Groq LLM call (for
judgments that need language understanding). The LLM call returns one JSON object so
we only spend one network round-trip per skill-matrix request.

Output shape:
    {
        "experience": 78, "education": 70, "technical_skills": 82, "soft_skills": 65,
        "achievements": 60, "keywords": 55, "formatting": 90, "job_relevance": 72,
        "overall": 73,
        "dimensions": { "<dim>": {"score": int, "reason": str}, ... }
    }
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

from crewai import LLM

from backend.services.AnalysisService import AnalysisService

LLM_MODEL = "groq/llama-3.3-70b-versatile"

METRIC_REGEX = re.compile(r"(\d+%|\d+x|\$\d+|\d+\+|\d+,\d+|\d{2,}\b)")
DEGREE_WORDS = ("bachelor", "master", "phd", "doctorate", "mba", "msc", "bsc", "ba ", "ma ")

WEIGHTS = {
    "experience": 0.20,
    "technical_skills": 0.20,
    "keywords": 0.15,
    "achievements": 0.15,
    "job_relevance": 0.10,
    "soft_skills": 0.08,
    "formatting": 0.07,
    "education": 0.05,
}
assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return max(0, min(100, int(round(float(value)))))
    except (TypeError, ValueError):
        return default


def _as_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _extract_text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return " ".join(str(v) for v in value.values() if isinstance(v, (str, int, float)))
    return str(value or "")


# ---------- experience years parsing ----------

def _parse_year(s: Any) -> Optional[int]:
    if not s:
        return None
    text = str(s).strip().lower()
    if text in {"present", "current", "now", "today"}:
        return datetime.now().year
    m = re.search(r"\b(19|20)\d{2}\b", text)
    return int(m.group(0)) if m else None


def _experience_years(experiences: List[Dict[str, Any]]) -> float:
    total = 0.0
    for exp in experiences:
        start = _parse_year(exp.get("start_date") or exp.get("startDate"))
        end = _parse_year(exp.get("end_date") or exp.get("endDate")) or datetime.now().year
        if start and end and end >= start:
            total += end - start
    return total


# ---------- per-dimension scorers ----------

def score_experience(content: Dict[str, Any]) -> Tuple[int, str]:
    exps = [e for e in _as_list(content.get("experiences")) if isinstance(e, dict)]
    count = len(exps)
    years = _experience_years(exps)
    descriptions = [_extract_text(e.get("description") or "") for e in exps]
    long_descs = sum(1 for d in descriptions if len(d.split()) >= 50)
    pct_long = (long_descs / count) if count else 0.0
    with_metric = sum(1 for d in descriptions if METRIC_REGEX.search(d))
    pct_metric = (with_metric / count) if count else 0.0

    raw = (
        0.30 * min(100, count * 20)
        + 0.30 * min(100, years * 10)
        + 0.20 * (pct_long * 100)
        + 0.20 * (pct_metric * 100)
    )
    score = _safe_int(raw)
    reason = (
        f"{count} role(s), ~{years:.0f} years total, "
        f"{long_descs}/{count or 1} detailed descriptions, "
        f"{with_metric}/{count or 1} with quantified outcomes."
    )
    return score, reason


def score_education(content: Dict[str, Any]) -> Tuple[int, str]:
    edus = [e for e in _as_list(content.get("education")) if isinstance(e, dict)]
    count = len(edus)
    text_blob = " ".join(_extract_text(e).lower() for e in edus)
    has_degree = any(w in text_blob for w in DEGREE_WORDS)
    raw = min(100, 60 + 10 * count + (30 if has_degree else 0))
    score = _safe_int(raw if count else max(20, raw - 40))
    reason = f"{count} entries; degree keyword detected: {has_degree}."
    return score, reason


def score_skills_count_only(content: Dict[str, Any]) -> int:
    skills = _as_list(content.get("skills"))
    return _safe_int(min(100, 20 + 8 * len(skills)))


def score_achievements(content: Dict[str, Any]) -> Tuple[int, str]:
    blobs: List[str] = []
    for e in _as_list(content.get("experiences")):
        if isinstance(e, dict):
            blobs.append(_extract_text(e.get("description")))
            for b in _as_list(e.get("bullets")):
                blobs.append(_extract_text(b))
    for p in _as_list(content.get("projects")):
        if isinstance(p, dict):
            blobs.append(_extract_text(p.get("description")))
    total = len(blobs)
    with_metric = sum(1 for t in blobs if METRIC_REGEX.search(t))
    score = _safe_int(100 * with_metric / total) if total else 0
    reason = f"{with_metric} of {total} bullets contain a measurable outcome."
    return score, reason


def score_formatting(content: Dict[str, Any]) -> Tuple[int, str]:
    has_pi = bool(
        (content.get("full_name") or "").strip()
        and ((content.get("email") or "").strip() or (content.get("phone") or "").strip())
    )
    sections = {
        "personal_info": has_pi,
        "experience": bool(_as_list(content.get("experiences"))),
        "education": bool(_as_list(content.get("education"))),
        "skills": bool(_as_list(content.get("skills"))),
    }
    base = sum(15 for present in sections.values() if present)
    extras = sum(
        10 for k in ("projects", "certifications", "languages") if bool(_as_list(content.get(k)))
    )
    title_bonus = 10 if (content.get("full_name") and content.get("target_job_title")) else 0
    score = _safe_int(min(100, base + min(30, extras) + title_bonus))
    present = [k for k, v in sections.items() if v]
    reason = (
        f"Core sections present: {', '.join(present) or 'none'}. "
        f"Extras: {min(30, extras) // 10}/3. Title bonus: {title_bonus // 10}."
    )
    return score, reason


def score_keywords_deterministic(
    user_skills: List[str], market_skills: List[str]
) -> Tuple[int, str]:
    if not market_skills:
        return 0, "No market keywords available for comparison."
    gap = AnalysisService.calculate_skill_gap(user_skills, market_skills)
    match_score = gap.get("match_score") or 0
    matching = gap.get("matching_skills") or []
    missing = gap.get("missing_skills") or []
    score = _safe_int(match_score)
    reason = (
        f"Matched {len(matching)} of {len(market_skills)} market keywords. "
        f"Top gaps: {', '.join(missing[:5]) if missing else 'none'}."
    )
    return score, reason


# ---------- LLM judgments ----------

_LLM_PROMPT = """You are evaluating a resume across three subjective dimensions.

Resume target job title: {target}
Skills listed: {skills}
Experience summaries: {experiences}

Return ONLY a JSON object with this exact schema (no prose, no markdown fences):
{{
  "technical_relevance": {{ "score": <int 0-100>, "reason": "<one short sentence>" }},
  "soft_skills": {{ "score": <int 0-100>, "reason": "<one short sentence>" }},
  "job_relevance": {{ "score": <int 0-100>, "reason": "<one short sentence>" }}
}}

Scoring guide:
- technical_relevance: how relevant the listed skills are to the target role
- soft_skills: how strongly leadership, collaboration, communication, problem-solving are evidenced in the experience descriptions
- job_relevance: how aligned the overall resume is with the target role"""


def _llm_judgments(content: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    target = content.get("target_job_title") or ""
    skills = [_extract_text(s) for s in _as_list(content.get("skills"))][:30]
    exps = []
    for e in _as_list(content.get("experiences"))[:3]:
        if isinstance(e, dict):
            title = e.get("job_title") or e.get("role") or e.get("title") or ""
            company = e.get("company") or e.get("company_name") or ""
            desc = _extract_text(e.get("description"))[:300]
            exps.append(f"{title} @ {company}: {desc}")

    prompt = _LLM_PROMPT.format(
        target=target or "(not specified)",
        skills=", ".join(s for s in skills if s) or "(none)",
        experiences=" || ".join(exps) or "(none)",
    )

    try:
        llm = LLM(model=LLM_MODEL, temperature=0.2)
        raw = llm.call(prompt)
        text = raw if isinstance(raw, str) else str(raw)
        clean = text.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```[a-zA-Z]*", "", clean).rstrip("`").strip()
        # find the first { ... } block
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1:
            clean = clean[start : end + 1]
        data = json.loads(clean)
    except Exception as e:
        fallback = {"score": 50, "reason": f"LLM judgment unavailable ({type(e).__name__})."}
        return {
            "technical_relevance": fallback,
            "soft_skills": fallback,
            "job_relevance": fallback,
        }

    def _norm(d: Any) -> Dict[str, Any]:
        if not isinstance(d, dict):
            return {"score": 50, "reason": "Malformed LLM output."}
        return {
            "score": _safe_int(d.get("score"), 50),
            "reason": str(d.get("reason", ""))[:240],
        }

    return {
        "technical_relevance": _norm(data.get("technical_relevance")),
        "soft_skills": _norm(data.get("soft_skills")),
        "job_relevance": _norm(data.get("job_relevance")),
    }


# ---------- public API ----------

class SkillMatrixService:
    @staticmethod
    def score_all(
        content: Dict[str, Any],
        market_skills: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        content = content or {}
        market_skills = market_skills or []

        exp_score, exp_reason = score_experience(content)
        edu_score, edu_reason = score_education(content)
        skills_count = score_skills_count_only(content)
        ach_score, ach_reason = score_achievements(content)
        fmt_score, fmt_reason = score_formatting(content)

        user_skills_raw: List[str] = []
        for s in _as_list(content.get("skills")):
            if isinstance(s, str):
                user_skills_raw.append(s)
            elif isinstance(s, dict):
                user_skills_raw.append(_extract_text(s.get("skill_name") or s.get("name") or ""))
        user_skills_raw = [s for s in user_skills_raw if s]

        kw_score, kw_reason = score_keywords_deterministic(user_skills_raw, market_skills)

        llm = _llm_judgments(content)
        tech_rel = llm["technical_relevance"]
        tech_score = _safe_int(0.4 * skills_count + 0.6 * tech_rel["score"])
        soft_score = tech_rel["score"]  # only used to satisfy type-checker
        soft = llm["soft_skills"]
        job_rel = llm["job_relevance"]

        dims = {
            "experience": {"score": exp_score, "reason": exp_reason},
            "education": {"score": edu_score, "reason": edu_reason},
            "technical_skills": {
                "score": tech_score,
                "reason": f"{skills_count}/100 by count blended with LLM relevance: {tech_rel['reason']}",
            },
            "soft_skills": {"score": soft["score"], "reason": soft["reason"]},
            "achievements": {"score": ach_score, "reason": ach_reason},
            "keywords": {"score": kw_score, "reason": kw_reason},
            "formatting": {"score": fmt_score, "reason": fmt_reason},
            "job_relevance": {"score": job_rel["score"], "reason": job_rel["reason"]},
        }

        scores = {k: v["score"] for k, v in dims.items()}
        overall = _safe_int(sum(WEIGHTS[k] * scores[k] for k in WEIGHTS))

        return {
            **scores,
            "overall": overall,
            "dimensions": dims,
        }
