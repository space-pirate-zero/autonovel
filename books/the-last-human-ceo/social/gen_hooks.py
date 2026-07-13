#!/usr/bin/env python3
"""One Opus call -> a short promo hook per episode + a set of quote lines.
Writes social/hooks.json ({ "1": "hook", ... , "29": ... }) and social/quotes.json (list).
Run:  uv run --with httpx --with python-dotenv python3 social/gen_hooks.py
"""
import os, json, re
from pathlib import Path
from dotenv import load_dotenv
import httpx

BASE = Path(__file__).resolve().parent.parent
load_dotenv(BASE / ".env", override=True)
MODEL = os.environ.get("AUTONOVEL_WRITER_MODEL", "claude-opus-4-8")
KEY = os.environ["ANTHROPIC_API_KEY"]
SOC = BASE / "social"
CH = BASE / "chapters"; INTRO = BASE / "audiobook" / "intros"


def title(n):
    p = (CH / "ch_coda.md") if n == 29 else (CH / f"ch_{n:02d}.md")
    return p.read_text().splitlines()[0].lstrip("# ").strip()


def call(prompt, max_tokens=4000):
    parts = []
    with httpx.stream("POST", "https://api.anthropic.com/v1/messages",
                      headers={"x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                      json={"model": MODEL, "max_tokens": max_tokens, "stream": True,
                            "messages": [{"role": "user", "content": prompt}]}, timeout=180) as r:
        r.raise_for_status()
        for line in r.iter_lines():
            if line.startswith("data:"):
                d = line[5:].strip()
                if d and d != "[DONE]":
                    try:
                        e = json.loads(d)
                        if e.get("type") == "content_block_delta" and e["delta"].get("type") == "text_delta":
                            parts.append(e["delta"]["text"])
                    except Exception:
                        pass
    return "".join(parts)


def main():
    eps = []
    for n in range(1, 30):
        intro = (INTRO / f"ch{n:02d}.txt")
        it = intro.read_text().strip()[:400] if intro.exists() else ""
        eps.append(f'EP {n} — "{title(n)}": {it}')
    listing = "\n\n".join(eps)
    prompt = f"""You are Space Pirate Zero, writing punchy social-media promo hooks for the audiobook
podcast "The Last Human CEO" (a tragic dark comedy: the last human CEO in the Fortune 100 vs the AI
replacing him). For EACH of the 29 episodes below, write ONE promo hook: max 11 words, evocative, in
your snarky-noir voice, NO spoilers beyond that episode's opening. Also write 8 standalone QUOTE lines
(max 14 words each) that capture the book's soul for quote-card graphics — a mix of the narrator's
voice and the themes (humanity vs machines, worth vs net worth, a man who confused a throne for a soul).

Return ONLY valid JSON: {{"hooks": {{"1": "...", ..., "29": "..."}}, "quotes": ["...", ... 8 total]}}

EPISODES:
{listing}"""
    out = call(prompt).strip()
    out = re.sub(r'^```\w*\n?|\n?```$', '', out).strip()
    data = json.loads(out)
    (SOC / "hooks.json").write_text(json.dumps(data["hooks"], indent=2))
    (SOC / "quotes.json").write_text(json.dumps(data["quotes"], indent=2))
    print(f"hooks: {len(data['hooks'])}, quotes: {len(data['quotes'])}")
    print("sample hook ep1:", data["hooks"].get("1"))
    print("sample quote:", data["quotes"][0])


if __name__ == "__main__":
    main()
