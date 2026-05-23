import os
import re

# Attempt to load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()
except ImportError:
    pass

from crewai import Agent, Crew, LLM, Task

from backend.services._prompts import BANNED_PHRASES, HUMAN_VOICE_RULES

MODEL_ID = "groq/llama-3.3-70b-versatile"


def _strip_ai_tells(text: str) -> str:
    """Last-mile cleanup. Even with the prompt rules, the model occasionally
    sneaks an em-dash or a banned phrase in. Catch the most common ones here."""
    if not text:
        return text
    cleaned = text.strip()

    # Strip surrounding quotes (the model often wraps the answer in them).
    cleaned = re.sub(r'^[\s"\'`*•\-]+', '', cleaned)
    cleaned = re.sub(r'[\s"\'`]+$', '', cleaned)

    # Em-dash and en-dash → regular dash with spaces
    cleaned = cleaned.replace("—", ", ").replace("–", "-")

    # Hard-stop on known offenders (case-insensitive, word-boundary).
    swaps: list[tuple[str, str]] = [
        (r"\bleveraging\b", "using"),
        (r"\bleverage(d)?\b", lambda m: "used" if m.group(1) else "use"),  # type: ignore[arg-type]
        (r"\bspearhead(ed|ing)?\b", "led"),
        (r"\butilize(d)?\b", lambda m: "used" if m.group(1) else "use"),  # type: ignore[arg-type]
        (r"\bsuccessfully\s+", ""),
        (r"\beffectively\s+", ""),
        (r"\bin order to\b", "to"),
        (r"\bsynergy\b", "alignment"),
        (r"\bsynergized\b", "aligned"),
        (r"\bsynergistic\b", "aligned"),
        (r"\bdrove growth\b", "grew the team"),
        (r"\bdelve into\b", "look at"),
        (r"\bdelved into\b", "looked at"),
        (r"\bas a (seasoned|passionate)\s+", ""),
        (r"\bshowcasing\b", "showing"),
        (r"\bdemonstrating my ability\b", "showing"),
    ]
    for pattern, replacement in swaps:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

    # Collapse double spaces left over from removals.
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)
    # Tidy up commas/periods that ended up with stray spaces before them.
    cleaned = re.sub(r"\s+([,.])", r"\1", cleaned)
    return cleaned.strip()


def expand_bulletpoint(short_bullet: str) -> str:
    """Turn a short, plain phrase into a single grounded, human-sounding bullet."""
    if not os.environ.get("GROQ_API_KEY"):
        print("Warning: GROQ_API_KEY environment variable is not set.")
        print("Please ensure your .env file contains GROQ_API_KEY=your_key_here")

    llm = LLM(model=MODEL_ID, temperature=0.5)  # lower temp = less flowery output

    expander_agent = Agent(
        role="Honest Resume Bullet Writer",
        goal=(
            "Turn a short, plain phrase from the user into a single resume bullet that "
            "a real recruiter would believe. The bullet must sound like a human wrote "
            "it on a Tuesday afternoon, not like a marketing brochure."
        ),
        backstory=(
            "You have read 10,000 resumes and seen every overwritten LLM-generated bullet. "
            "You hate corporate jargon. You write the way a senior engineer or analyst "
            "would describe their own work to a friend - concrete, specific, modest, in "
            "active voice. You would rather under-claim than make something up."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    task = Task(
        description=(
            f"{HUMAN_VOICE_RULES}\n\n"
            "LENGTH OVERRIDE FOR THIS TASK: Ignore the 'one sentence / two short ones' "
            "cap in rule 7 above. The user wants a FULL PARAGRAPH expansion - even if "
            "their input is just 2-3 words, return a substantive paragraph of 6-10 sentences "
            "(roughly 100-180 words). One paragraph, plain text, no bullet glyphs, no line breaks.\n\n"
            "TASK: Take the user's short phrase and write it out as a fuller resume description. "
            "Cover the practical scope: what kind of work was likely involved day-to-day, the "
            "category of tools or technologies typically used for that kind of work, the sort of "
            "collaboration or stakeholders that would normally be part of it, and what success "
            "in the role generally looks like. Keep every clause grounded in things that are "
            "true OF the kind of work in general - do NOT invent specifics about THIS person: "
            "no fake company names, no made-up dates, no percentages, no dollar amounts, no "
            "headcount, no project names, no specific clients, no specific frameworks unless "
            "the user named them. Generic-but-accurate beats specific-but-fabricated.\n\n"
            f"USER'S SHORT PHRASE: \"{short_bullet}\"\n\n"
            "Return ONLY the paragraph itself - no leading dash, no quotes, no preface, no "
            "explanation, no headings, no markdown. 6-10 sentences, ~100-180 words."
        ),
        expected_output=(
            "A single paragraph of 6-10 sentences (roughly 100-180 words), plain text, "
            "starting with a strong past-tense verb. No leading dash, no quotes, no bullet "
            "glyphs, no line breaks, no headings."
        ),
        agent=expander_agent,
    )

    crew = Crew(agents=[expander_agent], tasks=[task], verbose=False)
    raw = crew.kickoff()
    text = str(raw).strip()
    return _strip_ai_tells(text)


def main():
    print("=" * 60)
    print("   AI Resume Bullet Point Expander (Powered by Groq)   ")
    print("=" * 60)
    print("\nNote: Press Ctrl+C or type 'exit' to quit.\n")

    while True:
        try:
            user_input = input("\nEnter a short skill or phrase to expand: ").strip()
            if user_input.lower() in ("exit", "quit"):
                print("Exiting...")
                break
            if not user_input:
                print("Please enter a valid skill or phrase.")
                continue

            print("\nExpanding your bullet point...\n")
            expanded = expand_bulletpoint(user_input)

            print("\n" + "=" * 60)
            print("RESULT:")
            print("-" * 60)
            print(expanded)
            print("=" * 60)
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"\nAn error occurred: {e}")


# Expose the banned-phrase list so other modules can re-use it.
__all__ = ["expand_bulletpoint", "BANNED_PHRASES", "_strip_ai_tells"]


if __name__ == "__main__":
    main()
