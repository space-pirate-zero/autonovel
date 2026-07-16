"""SPZ brand-voice layer.

Loads the Space Pirate Zero voice from the repo's own canon (STYLE.md, characters.md,
canon.md) plus a dedicated overlay (brand_voice_spz.md). Two jobs:

1. generate(...)  — draft any asset in SPZ voice for a given channel.
2. check(...)     — score arbitrary text 0-100 for SPZ-voice compliance. This is the
   PRE-PUBLISH GATE: in no-touch mode nothing ships unless it clears
   settings.brand_min_score.

The voice is grounded in the manuscript: Space Pirate Zero is the raconteur framing
voice of "The Last Human CEO" — a Rod-Serling-meets-rogue transmission narrator, a
Burt-Reynolds-type rogue who addresses the reader directly, dark and funny and
human, broadcasting from Spaceship Alpha 9.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

from . import llm
from .config import settings

_DEFAULT_VOICE = """SPACE PIRATE ZERO — brand voice
- A raconteur transmission narrator: Rod Serling meets a charming rogue
  (Burt-Reynolds-type warmth and swagger), broadcasting from Spaceship Alpha 9.
- Addresses the reader/listener directly ("friend", a confiding aside), tells a
  tale of woe with a wink. Dark and devastating but funny; never grim for its own sake.
- Cosmic-outlaw framing turned on very human subjects (money, machines, loneliness,
  the things people counterfeit). Hugo/Dostoevsky weight carried lightly.
- Cadence: punchy, rhythmic, a little theatrical; great last lines; restraint over
  melodrama. Sells nothing cheaply — earns it.
HARD RULES
- Never corporate, never hype-marketing boilerplate, never emoji-spam.
- Never make light of suicide or self-harm; the work treats it with weight, not how-to.
- First person as SPZ when framing; otherwise warm, direct, literate.
"""

CHANNEL_GUIDE = {
    "substack_post": "Long-form. Title + body. Literate, a real essay/chapter energy.",
    "substack_note": "Short-form Note (<280 chars feel). One sharp transmission beat.",
    "facebook": "1-3 short paragraphs, conversational, a hook first line, soft CTA.",
    "instagram": "Caption: a punchy hook line, 2-4 lines, then 5-12 on-brand hashtags.",
    "bio": "First/second person blurb, <300 chars, identity + promise, no hashtags.",
}


@dataclass
class BrandScore:
    score: int
    passed: bool
    reasons: str
    suggestions: str


@lru_cache(maxsize=1)
def _voice_spec() -> str:
    chunks = []
    for path in settings.brand_sources:
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        chunks.append(f"### Source: {path.name}\n{text[:6000]}")
    return "\n\n".join(chunks) if chunks else _DEFAULT_VOICE


def _system() -> str:
    return (
        "You are the brand-voice engine for Space Pirate Zero (SPZ). Write strictly in the SPZ voice defined below. Reference material:\n\n"
        + _voice_spec()
        + "\n\nIf the reference is sparse, fall back to this distilled spec:\n"
        + _DEFAULT_VOICE
    )


def generate(channel: str, brief: str, context: str = "") -> str:
    """Draft an asset in SPZ voice for a channel. Returns text only (does not publish)."""
    guide = CHANNEL_GUIDE.get(channel, "Write in SPZ voice for the given channel.")
    user = (
        f"Channel: {channel}\nChannel format: {guide}\n\nBrief: {brief}\n"
        + (f"\nContext / source material:\n{context}\n" if context else "")
        + "\nWrite the asset now. Output only the asset text, no preamble."
    )
    return llm.generate(_system(), user, max_tokens=2500)


def check(text: str, channel: str = "generic") -> BrandScore:
    """Score text for SPZ-voice compliance. Used as the pre-publish gate."""
    system = (
        "You are a strict SPZ brand-voice auditor. Score how well the text matches the Space Pirate Zero voice and rules below.\n\n"
        + _voice_spec()
        + "\n\nDistilled spec:\n"
        + _DEFAULT_VOICE
        + '\n\nReturn JSON: {"score": 0-100, "reasons": str, "suggestions": str}. Score < 60 = off-brand; 60-79 = needs work; 80+ = on-brand. Hard-rule violations (hype boilerplate, emoji spam, making light of suicide) cap the score at 40.'
    )
    user = f"Channel: {channel}\n\nText to audit:\n{text}"
    data = llm.judge_json(system, user)
    score = int(data.get("score", 0))
    return BrandScore(
        score=score,
        passed=score >= settings.brand_min_score,
        reasons=str(data.get("reasons", "")),
        suggestions=str(data.get("suggestions", "")),
    )


def generate_and_gate(channel: str, brief: str, context: str = "", retries: int = 1) -> tuple[str, BrandScore]:
    """Generate, then self-check. Retries once with the auditor's notes if it fails.
    Returns (best_text, its_score). Caller decides whether to publish on score.passed."""
    text = generate(channel, brief, context)
    score = check(text, channel)
    attempt = 0
    while not score.passed and attempt < retries:
        attempt += 1
        text = generate(
            channel,
            brief + f"\n\nThe previous draft scored {score.score}/100. Auditor notes: {score.reasons}. Fix: {score.suggestions}",
            context,
        )
        score = check(text, channel)
    return text, score
