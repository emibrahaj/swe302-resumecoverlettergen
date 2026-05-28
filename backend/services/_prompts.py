"""
Shared prompt fragments used by every resume / cover-letter writing agent in the
project. This is the project's "humanizer": a CV-tuned adaptation of an AI-pattern
detector, turned into positive writing guidance so the model produces text that
reads like a real person wrote it — not a chatbot.

The goal is to strip the "AI texture" out of generated resume content: the tell-tale
vocabulary ("leveraged", "spearheaded", "delve"), the recycled phrasing ("a
testament to", "in today's fast-paced world"), and the structural fingerprints
(em-dashes, "it's not X, it's Y" parallelism, three-part abstract-noun lists,
stacked one-word fragments, filler transitions). HUMAN_VOICE_RULES carries the
full ruleset and is injected into every writing prompt; expand_bullet.py also runs
a last-mile regex cleanup (_strip_ai_tells) for anything that slips through.
"""

# Words/phrases that scream "this was written by an LLM". HUMAN_VOICE_RULES below is
# what the model actually reads; this list is the reference catalogue the rules and
# the post-processing cleanup draw from.
BANNED_PHRASES: tuple[str, ...] = (
    "leverage",
    "leveraging",
    "leveraged",
    "spearhead",
    "spearheaded",
    "synergy",
    "synergize",
    "synergistic",
    "cutting-edge",
    "best-in-class",
    "world-class",
    "robust",
    "holistic",
    "seamless",
    "dynamic",
    "agile",
    "scalable",
    "transformative",
    "game-changer",
    "game-changing",
    "next-gen",
    "innovative solutions",
    "drove growth",
    "thought leader",
    "thought leadership",
    "growth mindset",
    "passionate about",
    "deep dive",
    "ecosystem",
    "delve into",
    "delve",
    "navigate the complexities",
    "harness",
    "unlock",
    "empower",
    "streamline",
    "elevate",
    "realm",
    "tapestry",
    "multifaceted",
    "nuanced",
    "foster",
    "cultivate",
    "facilitate",
    "comprehensive",
    "a testament to",
    "move the needle",
    "paradigm",
    "in today's fast-paced world",
    "in the ever-evolving landscape",
    "when it comes to",
    "at the end of the day",
    "as a seasoned",
    "as a passionate",
    "showcasing my ability",
    "demonstrating my ability",
    "showcasing",
    "demonstrating",
    "furthermore",     # filler transition
    "moreover",        # filler transition
    "it's worth noting",  # filler hedge
    "not only",        # "not only X but also Y" parallelism
    "successfully",   # almost always filler
    "effectively",    # almost always filler
    "in order to",    # always "to"
    "utilize",        # always "use"
    "utilized",       # always "used"
    "—",              # em-dash is a model tell; use a hyphen or comma
    "✨",             # no decorative unicode in resume body
)


HUMAN_VOICE_RULES = """\
HARD RULES — these override any other formatting guidance you have. The goal:
writing that reads like a real person describing their own work to a sharp peer.
Calm, specific, grounded. Zero "AI texture" — a human reader (or an AI detector)
must never think a machine wrote it.

1. Sound like a competent human, not a chatbot. Plain words. Mostly short
   sentences with the occasional longer one — vary the rhythm; do NOT make every
   sentence the same length. If a line could sit on a SaaS homepage or a LinkedIn
   "thought leader" post, rewrite it.

2. NEVER use these words or phrases (hard ban — pick a plain synonym):
   leverage, spearhead, synergy, cutting-edge, best-in-class, world-class, robust,
   holistic, seamless, dynamic, agile, scalable, transformative, game-changer,
   game-changing, next-gen, innovative solutions, drove growth, thought leader,
   growth mindset, passionate about, deep dive, delve, ecosystem, navigate the
   complexities, harness, unlock, empower, streamline, elevate, realm, tapestry,
   multifaceted, nuanced, foster, cultivate, facilitate, comprehensive, a
   testament to, move the needle, paradigm, in today's fast-paced world, in the
   ever-evolving landscape, when it comes to, at the end of the day, as a seasoned,
   as a passionate, showcasing, demonstrating, successfully, effectively, utilize,
   in order to. Use plain verbs instead: led, built, shipped, ran, used, wrote,
   fixed, grew, designed, tested.

3. NEVER use em-dashes (—). Use a comma, a hyphen (-), or just split the
   sentence. Em-dashes are the single biggest AI tell.

4. NEVER invent numbers, percentages, names, dates, tools, or outcomes the user
   did not provide. Do NOT add "increased by 40%" or "saved $2M" unless that exact
   figure is in the user's input. Generic-but-true beats specific-but-fabricated —
   made-up metrics get the candidate caught.

5. Write as the candidate, in the FIRST PERSON and past tense: "I built…",
   "I led…", "I managed…", "I learned…", "I shipped…", "I handled…". Lead with what
   I actually did, using plain verbs (built, shipped, led, wrote, ran, fixed,
   managed, designed, tested, learned). Never use "Spearheaded", "Drove",
   "Orchestrated", "Championed", "Pioneered", "Leveraged". Vary the openings — don't
   start every sentence with "I".

6. Be concrete about the real work: what was done day to day, the kind of tools or
   tech normally used for it, who they worked with, what "done" looked like.
   "Led a team of 4 mobile engineers" beats "Led a high-performing team to achieve
   outstanding results."

7. Keep it tight. For a resume bullet: one sentence, two short ones at most — never
   a paragraph (unless a task explicitly asks you to expand into one). Cut any
   sentence that adds no real information.

8. NO AI sentence structures (these are dead giveaways):
   - No "It's not about X, it's about Y" parallelism.
   - No "not only X, but also Y".
   - No "It's not X. It's Y." negation reveals.
   - No stacked one-word fragments as punchlines ("Fast. Reliable. Scalable.").
   - No lists of three+ abstract nouns for weight ("creativity, passion, and drive").
   - No transition filler: Furthermore, Moreover, Additionally, In conclusion,
     It's worth noting, In summary.

9. No filler intros ("Responsible for…", "Tasked with…", "Here's a breakdown",
   "In today's…", "When it comes to…"). Just say what was done. No hollow
   intensifiers (crucial, essential, incredibly, significantly) and no grandiose
   affirmations ("a testament to…", "showcasing my ability to…").

10. Match the user's voice. If their input is plain English, keep it plain. Don't
    import corporate jargon they didn't use. Stay modest — under-sell, don't
    over-claim.

11. If the user's input is too vague to write a real bullet from (e.g. just
    "team"), produce a short, plain, generic bullet and add nothing made up.
"""


def language_directive(language: str | None) -> str:
    """Explicit instruction telling the model which language to write in.

    The app supports English ('en') and Albanian ('sq'). Without this, the model
    always defaults to English regardless of the user's chosen UI language, which
    is why Albanian output was either missing or read like a word-for-word machine
    translation. Returned text is meant to be prepended to a writing prompt.
    """
    lang = (language or "en").strip().lower()
    if lang in ("sq", "al", "alb", "albanian", "shqip"):
        return (
            "LANGUAGE: Write your ENTIRE response in Albanian (Shqip). Use natural, "
            "fluent, professional Albanian the way a native speaker would write a CV "
            "or cover letter — correct grammar, correct definite/indefinite noun "
            "forms, and proper use of the letters ë and ç. Do NOT translate word for "
            "word from English and do NOT leave English filler words in the prose. "
            "Keep proper nouns and technology names (e.g. Python, React, Excel, "
            "Google) in their original form. All the human-voice rules above still "
            "apply: no robotic, machine-translated, or corporate phrasing."
        )
    return (
        "LANGUAGE: Write your entire response in clear, natural, professional "
        "English."
    )
