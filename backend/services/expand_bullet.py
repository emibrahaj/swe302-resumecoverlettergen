import os
import re

try:
    from dotenv import load_dotenv

    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv()
except ImportError:
    pass

from groq import Groq

from backend.services._prompts import BANNED_PHRASES, HUMAN_VOICE_RULES, language_directive

MODEL_ID = "llama-3.3-70b-versatile"


def _strip_ai_tells(text: str) -> str:
    """Last-mile cleanup. Even with the prompt rules, the model occasionally
    sneaks an em-dash, a filler transition, or a banned verb in. Catch the most
    common ones here so the output never carries an obvious AI fingerprint."""
    if not text:
        return text

    cleaned = text.strip()

    cleaned = re.sub(r'^[\s"\'`*•\-]+', "", cleaned)
    cleaned = re.sub(r'[\s"\'`]+$', "", cleaned)

    cleaned = cleaned.replace("—", ", ").replace("–", "-")

    # Drop filler transition openers (Furthermore, Moreover, It's worth noting…)
    # at the start of a sentence and re-capitalize the word that followed them.
    def _drop_transition(m: "re.Match[str]") -> str:
        return f"{m.group(1)}{m.group(3).upper()}"

    cleaned = re.sub(
        r"(^|[.!?]\s+)"
        r"(Furthermore|Moreover|Additionally|In conclusion|In summary|Notably|"
        r"Importantly|It'?s worth noting that|Needless to say)[,:]?\s+"
        r"([A-Za-zÀ-ÿ])",
        _drop_transition,
        cleaned,
        flags=re.IGNORECASE,
    )

    swaps: list[tuple[str, object]] = [
        (r"\bleveraging\b", "using"),
        (r"\bleverage(d)?\b", lambda m: "used" if m.group(1) else "use"),
        (r"\bspearhead(ed|ing)?\b", "led"),
        (r"\butilizing\b", "using"),
        (r"\butilize(d)?\b", lambda m: "used" if m.group(1) else "use"),
        (r"\bharnessed\b", "used"),
        (r"\bharnessing\b", "using"),
        (r"\bharness\b", "use"),
        (r"\bstreamlined\b", "simplified"),
        (r"\bstreamlining\b", "simplifying"),
        (r"\bstreamline\b", "simplify"),
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

    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)
    cleaned = re.sub(r"\s+([,.])", r"\1", cleaned)

    # The verb swaps above replace with lowercase, which can leave a sentence
    # starting in lowercase (e.g. "Leveraged ..." -> "used ..."). Re-capitalize
    # the first letter of each sentence. Covers accented Albanian letters too.
    cleaned = re.sub(
        r"(^|[.!?]\s+)([a-zà-ÿ])",
        lambda m: m.group(1) + m.group(2).upper(),
        cleaned,
    )

    return cleaned.strip()


def expand_bulletpoint(short_bullet: str, language: str = "en", kind: str = "bullet") -> str:
    """Turn a short, plain phrase into a grounded, human-sounding, first-person CV text.

    `language` is the user's UI language ('en' or 'sq').
    `kind` selects the writing task:
      - "bullet"  -> a fuller work/experience/project description (default)
      - "summary" -> a personal Professional Summary about the candidate
    """
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing on the server")

    client = Groq(api_key=api_key)

    directive = language_directive(language)

    if kind == "summary":
        # A Professional Summary is about the PERSON, not a description of the role
        # or field. Writing it like the work-bullet expander produces textbook prose
        # ("Students in this field typically...", "The day-to-day work involves..."),
        # which is exactly what we must avoid.
        task = (
            "TASK: Rewrite the user's input into a Professional Summary for THEIR CV, "
            "written in the FIRST PERSON, as the candidate speaking about themselves "
            "(\"I am...\", \"I have...\", \"I enjoy...\", \"I am developing...\", "
            "\"My studies have helped me...\"). Write 3 to 5 sentences, one short "
            "paragraph (~50-90 words). Focus ONLY on the candidate: their background, "
            "skills, interests, strengths, and what they are working toward.\n\n"
            "Do NOT describe what the job, role, field, or degree generally involves, "
            "and do NOT describe what people or students in this field typically do. "
            "These framings are BANNED: \"Students in this field...\", \"A [X] student...\", "
            "\"The day-to-day work involves...\", \"They learn...\", \"Success in this role "
            "generally means...\", \"Overall, the goal of...\". If the input is sparse, make "
            "it stronger and more professional, but keep every sentence about ME - never pad "
            "it with a generic description of the field. Do not invent specific employers, "
            "dates, or metrics the user didn't give.\n\n"
            f"USER'S INPUT: \"{short_bullet}\"\n\n"
            "Return ONLY the summary paragraph - no quotes, no preface, no heading, no "
            "markdown. First person, 3-5 sentences, ~50-90 words."
        )
        max_tokens = 220
    else:
        task = (
            "LENGTH OVERRIDE FOR THIS TASK: Ignore the 'one sentence / two short ones' "
            "cap in rule 7 above. The user wants a FULL PARAGRAPH expansion - even if "
            "their input is just 2-3 words, return a substantive paragraph of 6-10 sentences "
            "(roughly 100-180 words). One paragraph, plain text, no bullet glyphs, no line breaks.\n\n"
            "TASK: Rewrite the user's short phrase as a fuller resume description, written "
            "in the FIRST PERSON and past tense, as the candidate describing their own work "
            "(\"I managed...\", \"I handled...\", \"I learned...\", \"I worked with...\"). "
            "Cover the practical scope: what I likely did day to day, the kind of tools or "
            "technologies normally used for that work, who I would have worked with, and what "
            "I took away from it. Vary the sentence openings so it doesn't start every sentence "
            "with \"I\". Keep every clause grounded in what is generally true of that kind of "
            "work - do NOT invent specifics about me: no fake company names, no made-up dates, "
            "no percentages, no dollar amounts, no headcount, no project names, no specific "
            "clients, no specific frameworks unless the user named them. Generic-but-accurate "
            "beats specific-but-fabricated.\n\n"
            f"USER'S SHORT PHRASE: \"{short_bullet}\"\n\n"
            "Return ONLY the paragraph itself - no leading dash, no quotes, no preface, no "
            "explanation, no headings, no markdown. Write in the first person. 6-10 sentences, "
            "~100-180 words."
        )
        max_tokens = 350

    prompt = f"{HUMAN_VOICE_RULES}\n\n{directive}\n\n{task}"

    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an honest resume writer. Write concrete, grounded, human-sounding "
                    "CV text in the first person (\"I am...\", \"I have...\", \"I did...\"), about "
                    "THIS candidate - never a generic description of a field, role, or degree, and "
                    "never with corporate jargon or invented details. "
                    + directive
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.5,
        max_tokens=max_tokens,
    )

    text = response.choices[0].message.content.strip()
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


__all__ = ["expand_bulletpoint", "BANNED_PHRASES", "_strip_ai_tells"]


if __name__ == "__main__":
    main()