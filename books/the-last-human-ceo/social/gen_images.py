#!/usr/bin/env python3
"""
gen_images.py — branded social image assets for The Last Human CEO (SPZ brand).
Outputs into social/img/. Run:  uv run --with pillow python3 social/gen_images.py
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent          # book dir
OUT = BASE / "social" / "img"; OUT.mkdir(parents=True, exist_ok=True)
F = BASE.parent.parent / "fonts"                        # repo fonts/
COVER = BASE / "art" / "podcast_cover_src.png"

VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (138, 144, 160)


def font(name, size): return ImageFont.truetype(str(F / name), size)
def orb(s): return font("Orbitron-900.ttf", s)
def orb7(s): return font("Orbitron-700.ttf", s)
def body(s): return font("SpaceGrotesk-500.ttf", s)
def mono(s): return font("JetBrainsMono-400.ttf", s)


def bg(w, h):
    """Void canvas with two soft neon glows."""
    img = Image.new("RGBA", (w, h), VOID + (255,))
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.ellipse((-w*0.2, -h*0.25, w*0.5, h*0.3), fill=(255, 20, 147, 42))
    od.ellipse((w*0.6, h*0.55, w*1.3, h*1.25), fill=(0, 240, 255, 30))
    ov = ov.filter(ImageFilter.GaussianBlur(60))
    return Image.alpha_composite(img, ov).convert("RGB")


def fit(d, text, path, start, maxw):
    s = start
    while s > 10:
        f = font(path, s)
        if d.textlength(text, font=f) <= maxw:
            return f
        s -= 2
    return font(path, 10)


def cover_img(size):
    return Image.open(COVER).convert("RGB").resize((size, size))


def centered(d, text, f, y, w, fill, x0=0):
    tw = d.textlength(text, font=f)
    d.text(((w - tw) / 2 + x0, y), text, font=f, fill=fill)


def square_launch():
    W = H = 1080
    img = bg(W, H); d = ImageDraw.Draw(img)
    cov = cover_img(680)
    img.paste(cov, ((W - 680) // 2, 70))
    d.rectangle((0, 70, W, 74), fill=(255, 20, 147, 255))  # top accent hairline
    centered(d, "A SPACE PIRATE ZERO TRANSMISSION", mono(21), 780, W, CYAN)
    tf = fit(d, "THE LAST HUMAN CEO", "Orbitron-900.ttf", 78, W - 120)
    centered(d, "THE LAST HUMAN CEO", tf, 812, W, PINK)
    centered(d, "A full-cast audiobook · 29 chapters · 12.6 hours", body(28), 900, W, PAPER)
    centered(d, "OUT NOW", orb7(34), 948, W, PAPER)
    centered(d, "> Apple Podcasts · Spotify · lasthumanceo.com", mono(23), 1005, W, CYAN)
    img.save(OUT / "ig_square.jpg", quality=92)
    return "ig_square.jpg 1080x1080"


def story_launch():
    W, H = 1080, 1920
    img = bg(W, H); d = ImageDraw.Draw(img)
    cov = cover_img(760)
    img.paste(cov, ((W - 760) // 2, 300))
    centered(d, "A SPACE PIRATE ZERO TRANSMISSION", mono(24), 200, W, CYAN)
    tf = fit(d, "THE LAST", "Orbitron-900.ttf", 130, W - 120)
    centered(d, "THE LAST", tf, 1130, W, PINK)
    centered(d, "HUMAN CEO", tf, 1130 + tf.size + 8, W, PAPER)
    y = 1130 + 2 * tf.size + 60
    centered(d, "A full-cast audiobook", body(40), y, W, PAPER)
    centered(d, "29 chapters · 12.6 hours · out now", body(32), y + 60, W, MUTED)
    centered(d, "> Apple Podcasts · Spotify", mono(30), y + 150, W, CYAN)
    centered(d, "lasthumanceo.com", mono(34), y + 195, W, PINK)
    centered(d, "> signal finds signal", mono(26), 1830, W, CYAN)
    img.save(OUT / "ig_story.jpg", quality=92)
    return "ig_story.jpg 1080x1920"


def x_card():
    W, H = 1600, 900
    img = bg(W, H); d = ImageDraw.Draw(img)
    cov = cover_img(780)
    img.paste(cov, (60, 60))
    x = 900; maxw = 1540 - x
    d.text((x, 120), "A SPACE PIRATE ZERO TRANSMISSION", font=mono(24), fill=CYAN)
    tf = fit(d, "HUMAN CEO", "Orbitron-900.ttf", 108, maxw)
    d.text((x, 180), "THE LAST", font=tf, fill=PINK)
    d.text((x, 180 + tf.size + 12), "HUMAN CEO", font=tf, fill=PAPER)
    y = 180 + 2 * tf.size + 60
    d.text((x, y), "A full-cast audiobook", font=body(34), fill=PAPER)
    d.text((x, y + 46), "29 chapters · 12.6 hours · out now", font=body(27), fill=MUTED)
    d.text((x, y + 130), "> Apple · Spotify · lasthumanceo.com", font=mono(25), fill=CYAN)
    d.rectangle((0, H - 6, W, H), fill=PINK)
    img.save(OUT / "x_card.jpg", quality=92)
    return "x_card.jpg 1600x900"


def now_streaming():
    W = H = 1080
    img = bg(W, H); d = ImageDraw.Draw(img)
    cov = cover_img(560)
    img.paste(cov, ((W - 560) // 2, 120))
    centered(d, "NOW STREAMING", orb7(56), 720, W, PINK)
    centered(d, "THE LAST HUMAN CEO", orb7(40), 800, W, PAPER)
    centered(d, "the last human boss in the Fortune 100 vs the machine", body(26), 860, W, MUTED)
    centered(d, "> Apple Podcasts   ·   Spotify   ·   RSS", mono(26), 940, W, CYAN)
    centered(d, "lasthumanceo.com", mono(30), 985, W, PINK)
    img.save(OUT / "now_streaming.jpg", quality=92)
    return "now_streaming.jpg 1080x1080"


def quote_card(line="A machine can run a company.\nBut it cannot love one.", ep="EP 01 — The Premium Blend"):
    W = H = 1080
    img = bg(W, H); d = ImageDraw.Draw(img)
    d.text((80, 120), "//", font=orb(150), fill=(60, 12, 34))
    qf = font("EB Garamond via", 1) if False else font("SpaceGrotesk-700.ttf", 62)
    lines = line.split("\n")
    y = 380
    for ln in lines:
        qf = fit(d, ln, "SpaceGrotesk-700.ttf", 62, W - 180)
        centered(d, ln, qf, y, W, PAPER)
        y += qf.size + 16
    centered(d, "THE LAST HUMAN CEO", mono(24), y + 60, W, CYAN)
    centered(d, ep, mono(22), y + 96, W, MUTED)
    centered(d, "> lasthumanceo.com", mono(24), 980, W, PINK)
    img.save(OUT / "quote_01.jpg", quality=92)
    return "quote_01.jpg 1080x1080"


def scrim(img, frac=0.62, strength=0.94):
    """Darken the bottom `frac` of the image with a void gradient for text legibility."""
    w, h = img.size
    grad = Image.new("L", (1, h), 0)
    for y in range(h):
        t = max(0.0, (y / h - (1 - frac)) / frac)
        grad.putpixel((0, y), int(255 * min(1.0, t * t) * strength))
    grad = grad.resize((w, h))
    return Image.composite(Image.new("RGB", (w, h), VOID), img, grad)


def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def episode_cards():
    made = []
    for n in range(1, 30):
        art = BASE / "art" / "episodes" / f"ep{n:02d}.jpg"
        if not art.exists():
            continue
        W = 1080
        img = Image.open(art).convert("RGB").resize((W, W))
        img = scrim(img, frac=0.6)
        d = ImageDraw.Draw(img)
        import json as _j
        hooks = _j.loads((BASE / "social" / "hooks.json").read_text())
        title = (BASE / "chapters" / ("ch_coda.md" if n == 29 else f"ch_{n:02d}.md")).read_text().splitlines()[0].lstrip("# ").strip()
        hook = hooks.get(str(n), "")
        d.text((60, 60), "THE LAST HUMAN CEO", font=mono(22), fill=CYAN)
        y = 690
        d.text((60, y), f"EP {n:02d}", font=mono(24), fill=CYAN)
        tf = fit(d, title, "Orbitron-700.ttf", 46, W - 120)
        d.text((60, y + 36), title, font=tf, fill=PINK)
        hy = y + 36 + tf.size + 18
        hf = font("SpaceGrotesk-500.ttf", 30)
        for ln in wrap(d, hook, hf, W - 120):
            d.text((60, hy), ln, font=hf, fill=PAPER); hy += 40
        d.text((60, 1010), "> lasthumanceo.com", font=mono(22), fill=MUTED)
        p = OUT / f"ep_{n:02d}.jpg"; img.save(p, quality=90)
        made.append(p.name)
    print(f"  -> {len(made)} episode cards (ep_01..ep_{len(made):02d}.jpg)")


def episode_cards_vertical():
    """9:16 (1080x1920) Story-format episode cards: square art up top, text below on void."""
    import json as _j
    hooks = _j.loads((BASE / "social" / "hooks.json").read_text())
    made = []
    for n in range(1, 30):
        art = BASE / "art" / "episodes" / f"ep{n:02d}.jpg"
        if not art.exists():
            continue
        W, H = 1080, 1920
        img = bg(W, H); d = ImageDraw.Draw(img)
        sq = Image.open(art).convert("RGB").resize((W, W))
        sq = scrim(sq, frac=0.22, strength=0.9)   # fade the art's bottom into the void
        img.paste(sq, (0, 120))
        title = (BASE / "chapters" / ("ch_coda.md" if n == 29 else f"ch_{n:02d}.md")).read_text().splitlines()[0].lstrip("# ").strip()
        hook = hooks.get(str(n), "")
        d.text((60, 44), "THE LAST HUMAN CEO", font=mono(24), fill=CYAN)
        y = 1290
        d.text((60, y), f"EP {n:02d}", font=mono(28), fill=CYAN)
        tf = fit(d, title, "Orbitron-700.ttf", 54, W - 120)
        d.text((60, y + 44), title, font=tf, fill=PINK)
        hy = y + 44 + tf.size + 22
        hf = font("SpaceGrotesk-500.ttf", 36)
        for ln in wrap(d, hook, hf, W - 120):
            d.text((60, hy), ln, font=hf, fill=PAPER); hy += 48
        d.text((60, 1770), "> Apple Podcasts · Spotify", font=mono(26), fill=CYAN)
        d.text((60, 1812), "lasthumanceo.com", font=mono(30), fill=PINK)
        p = OUT / f"ep_v_{n:02d}.jpg"; img.save(p, quality=90); made.append(p.name)
    print(f"  -> {len(made)} vertical Story cards (ep_v_01..ep_v_{len(made):02d}.jpg)")


def quote_cards():
    import json as _j
    quotes = _j.loads((BASE / "social" / "quotes.json").read_text())
    for i, q in enumerate(quotes, 1):
        W = H = 1080
        img = bg(W, H); d = ImageDraw.Draw(img)
        d.text((80, 110), "//", font=orb(150), fill=(60, 12, 34))
        lines = wrap(d, q, font("SpaceGrotesk-700.ttf", 60), W - 200)
        # shrink if too many lines
        fs = 60
        while len(lines) > 4 and fs > 34:
            fs -= 4; lines = wrap(d, q, font("SpaceGrotesk-700.ttf", fs), W - 200)
        qf = font("SpaceGrotesk-700.ttf", fs)
        total = len(lines) * (fs + 16)
        y = (H - total) // 2 - 30
        for ln in lines:
            centered(d, ln, qf, y, W, PAPER); y += fs + 16
        centered(d, "THE LAST HUMAN CEO", mono(24), y + 50, W, CYAN)
        centered(d, "> lasthumanceo.com", mono(22), 985, W, PINK)
        img.save(OUT / f"quote_{i:02d}.jpg", quality=92)
    print(f"  -> {len(quotes)} quote cards (quote_01..quote_{len(quotes):02d}.jpg)")


if __name__ == "__main__":
    import sys
    arg = sys.argv[1] if len(sys.argv) > 1 else "launch"
    if arg in ("launch", "all"):
        for fn in (square_launch, story_launch, x_card, now_streaming, quote_card):
            print("  ->", fn())
    if arg in ("episodes", "all"):
        episode_cards()
    if arg in ("episodes_v", "all"):
        episode_cards_vertical()
    if arg in ("quotes", "all"):
        quote_cards()
    print("done ->", OUT)
