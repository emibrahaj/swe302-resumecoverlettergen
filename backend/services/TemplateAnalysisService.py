"""
TemplateAnalysisService — extracts a deterministic spec from a Jinja2 template.

This is the *non-LLM* input to the Template Analysis Agent. We parse the
template file via regex (cheap, predictable) and emit a JSON dict the agent
can then rationalize about. The agent's job is to translate this raw spec
into a fitting plan with recommended word/item budgets per section.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .TemplateService import TEMPLATES_DIR, _resolve_template_file

# Heuristic budgets when nothing template-specific is detected.
DEFAULT_BUDGETS: dict[str, dict[str, int]] = {
    "summary":         {"max_words": 60},
    "about":           {"max_words": 60},
    "experiences":     {"bullets_per_role": 4, "max_words_per_bullet": 22, "max_roles": 5},
    "education":       {"max_items": 4, "max_words_per_entry": 25},
    "skills":          {"max_items": 12},
    "projects":        {"max_items": 4, "max_words_per_description": 30},
    "certifications":  {"max_items": 5, "max_words_per_entry": 18},
    "languages":       {"max_items": 5},
}

_PLACEHOLDER_RE = re.compile(r"{{\s*data\.([a-zA-Z_][a-zA-Z0-9_]*)")
_FOR_LOOP_RE = re.compile(r"{%\s*for\s+(\w+)\s+in\s+data\.([a-zA-Z_][a-zA-Z0-9_]*)")


def _read_template_text(template_id: str | None) -> tuple[str, str]:
    """Returns (template_file_name, raw_html_text). Falls back to template_1.html."""
    file_name = _resolve_template_file(None, template_id)
    path = Path(TEMPLATES_DIR) / file_name
    if not path.exists():
        path = Path(TEMPLATES_DIR) / "template_1.html"
        file_name = "template_1.html"
    return file_name, path.read_text(encoding="utf-8")


def analyze_template(template_id: str | None) -> dict[str, Any]:
    """Return a deterministic spec for the given template id.

    Output shape:
        {
          "template_id": <input>,
          "template_file": "template_3.html",
          "placeholders": ["full_name", "target_job_title", "email", ...],
          "sections": {
              "experiences": {"bullets_per_role": 4, "max_words_per_bullet": 22, ...},
              ...
          },
          "has_photo": bool,
          "column_count": 1 or 2
        }
    """
    file_name, html = _read_template_text(template_id)

    placeholders = sorted({m.group(1) for m in _PLACEHOLDER_RE.finditer(html)})
    iterables = sorted({m.group(2) for m in _FOR_LOOP_RE.finditer(html)})

    sections: dict[str, dict[str, int]] = {}
    for it in iterables:
        sections[it] = dict(DEFAULT_BUDGETS.get(it, {"max_items": 6, "max_words_per_entry": 25}))
    for single in ("about", "summary"):
        if single in placeholders:
            sections[single] = dict(DEFAULT_BUDGETS[single])

    has_photo = "photo_url" in placeholders or "photo" in placeholders
    # Cheap two-column heuristic: any of these class names in template => 2 columns
    column_count = 2 if re.search(r"(two-?col|grid-cols-2|col-left|sidebar)", html, re.IGNORECASE) else 1

    return {
        "template_id": template_id,
        "template_file": file_name,
        "placeholders": placeholders,
        "sections": sections,
        "has_photo": has_photo,
        "column_count": column_count,
    }
