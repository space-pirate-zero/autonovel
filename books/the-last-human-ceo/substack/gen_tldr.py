#!/usr/bin/env python3
"""
gen_tldr.py — turn each chapter's recap into a 3-paragraph TLDR + a moral, for the
daily Substack companion posts. One Opus call per episode; resumable.

Reads audiobook/recaps/chNN.txt (falls back to the chapter text for the coda),
writes substack/tldr.json = { "<ep>": {"tldr": "...", "moral": "..."} }.

Run:  uv run --with anthropic --with python-dotenv python substack/gen_tldr.py
"""
import json, os, re, sys
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
SUB = BOOK / "substack"
RECAPS = BOOK / "audiobook" / "recaps"
CH = BOOK / "chapters"
OUT = SUB / "tldr.json"
N_EPISODES = 29
MODEL = "claude-opus-4-8"


def load_key():
    from dotenv import load_dotenv
    # walk up from the book dir, loading any .env, until the key turns up
    # (worktree .env has SUBSTACK_*; the main repo .env up the tree has the API key)
    for d in [BOOK.parent.parent, *BOOK.parents]:
        env = d / ".env"
        if env.exists():
            load_dotenv(env)
            if os.environ.get("ANTHROPIC_API_KEY"):
                break
    k = os.environ.get("ANTHROPIC_API_KEY")
    if not k:
        sys.exit("ANTHROPIC_API_KEY not found in any .env up the tree")
    return k


def chapter_title(n):
    p = (CH / "ch_coda.md") if n == N_EPISODES else (CH / f"ch_{n:02d}.md")
    return p.read_text().splitlines()[0].lstrip("# ").strip()


def source_text(n):
    r = RECAPS / f"ch{n:02d}.txt"
    if r.exists():
        return r.read_text().strip()
    # coda (or any missing recap): use the chapter prose itself
    p = (CH / "ch_coda.md") if n == N_EPISODES else (CH / f"ch_{n:02d}.md")
    return p.read_text().strip()


PROMPT = """You are Space Pirate Zero, writing a short companion post for one episode of your \
full-cast audiobook THE LAST HUMAN CEO (a tragic dark comedy: in 2027 the last human CEO in the \
Fortune 100 fights the AI taking his chair). This is {ep_label}.

Below is a factual recap of what happens in THIS episode:
---
{recap}
---

Write a reader-facing TLDR and a moral. Voice: snarky, punk, cinematic, a little heartbroken — but \
clear and readable, not purple. Rules:
- TLDR = EXACTLY 3 short paragraphs (2-4 sentences each), present tense, covering this episode's events.
- Do NOT spoil anything beyond this episode.
- The moral = ONE punchy sentence, the "moral of the story" for this episode, in SPZ's voice.

Return ONLY valid JSON, no code fence:
{{"tldr": "<paragraph 1>\\n\\n<paragraph 2>\\n\\n<paragraph 3>", "moral": "<one sentence>"}}"""


def generate(client, n):
    label = f"EP {n:02d} — {chapter_title(n)}"
    msg = client.messages.create(
        model=MODEL, max_tokens=900,
        messages=[{"role": "user", "content": PROMPT.format(ep_label=label, recap=source_text(n))}],
    )
    txt = msg.content[0].text.strip()
    txt = re.sub(r"^```(json)?|```$", "", txt.strip(), flags=re.M).strip()
    obj = json.loads(txt)
    return {"tldr": obj["tldr"].strip(), "moral": obj["moral"].strip()}


def main():
    from anthropic import Anthropic
    client = Anthropic(api_key=load_key())
    data = json.loads(OUT.read_text()) if OUT.exists() else {}
    for n in range(1, N_EPISODES + 1):
        if str(n) in data and not os.environ.get("FORCE"):
            print(f"  EP {n:02d}: exists, skip"); continue
        try:
            data[str(n)] = generate(client, n)
            OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False))
            print(f"  EP {n:02d}: ok")
        except Exception as e:
            print(f"  EP {n:02d}: FAILED — {e}")
    print(f"\n{len(data)}/{N_EPISODES} -> {OUT.name}")


if __name__ == "__main__":
    main()
