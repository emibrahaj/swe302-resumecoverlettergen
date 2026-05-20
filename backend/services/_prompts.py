"""
Shared prompt fragments used by every resume-writing agent in the project.

The goal is to make AI-generated resume bullets sound like a real person wrote
them — not a chatbot. Heavy explicit guidance below, because models default to
the same corporate-speak ("leveraged", "spearheaded", "synergized") unless told
not to.
"""

# Words/phrases that scream "this was written by an LLM" — keep this list short
# enough that the model can actually internalize it.
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
    "transformative",
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
    "in today's fast-paced world",
    "as a seasoned",
    "as a passionate",
    "showcasing my ability",
    "demonstrating my ability",
    "showcasing",
    "demonstrating",
    "successfully",   # almost always filler
    "effectively",    # almost always filler
    "in order to",    # always "to"
    "utilize",        # always "use"
    "utilized",       # always "used"
    "—",              # em-dash is a model tell; use a hyphen or comma
    "✨",             # no decorative unicode in resume body
)


HUMAN_VOICE_RULES = """\
HARD RULES — these override any other formatting guidance you have:

1. Sound like a competent human, not a chatbot. Short sentences. Plain words.
   If a line could appear in a LinkedIn parody account, rewrite it.

2. NEVER use these words or phrases (this is a hard ban — pick a synonym):
   leverage, leveraging, leveraged, spearhead, spearheaded, synergy, synergize,
   cutting-edge, best-in-class, world-class, robust, holistic, transformative,
   innovative solutions, drove growth, thought leader, growth mindset,
   passionate about, deep dive, ecosystem, delve into, delve, navigate the
   complexities, in today's fast-paced world, as a seasoned, as a passionate,
   showcasing, demonstrating, successfully, effectively, utilize, utilized,
   in order to. Use plain alternatives — "led", "built", "shipped", "used".

3. NEVER use em-dashes (—). Use a comma, a hyphen (-), or just split the
   sentence. Em-dashes are the single biggest AI tell.

4. NEVER invent numbers, percentages, or outcomes the user did not provide.
   Do NOT add "increased by 40%" or "saved $2M" unless those exact numbers
   came from the user's input. Made-up metrics get the candidate caught.

5. Start each bullet with a specific past-tense verb the user actually did.
   Good: "Built", "Shipped", "Led", "Wrote", "Migrated", "Reviewed", "Mentored".
   Bad: "Spearheaded", "Drove", "Orchestrated", "Championed", "Pioneered".

6. Be specific. "Led a team of 4 mobile engineers" beats "Led a high-
   performing team to achieve outstanding results."

7. One sentence per bullet. Max two short ones. Never a paragraph.

8. No filler intros ("Responsible for…", "Tasked with…"). Just say what
   was done.

9. Match the user's voice. If their input is plain English, keep it plain.
   Don't import corporate jargon they didn't use.

10. If the user's input is too vague to write a real bullet from (e.g. just
    "team"), produce a short generic bullet and add nothing made up.
"""
