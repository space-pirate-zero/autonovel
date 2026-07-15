#!/usr/bin/env python3
"""Dynamic 2nd-edition cover for The Last Human CEO — anime hero + SPZ brand type."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).resolve().parent
BOOK = HERE.parents[2]          # .../the-last-human-ceo (2nd -> cover -> art -> book)
F = BOOK.parent.parent / "fonts"
EP = BOOK / "art" / "episodes"
W, H = 1600, 2400
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (138, 144, 160)


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 20 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)


def canvas():
    img = Image.new("RGBA", (W, H), VOID + (255,))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.ellipse((-W*0.3, -H*0.05, W*0.7, H*0.30), fill=(255, 20, 147, 60))
    d.ellipse((W*0.4, H*0.62, W*1.4, H*1.05), fill=(0, 240, 255, 46))
    d.ellipse((W*0.55, -H*0.05, W*1.25, H*0.22), fill=(0, 240, 255, 30))
    img = Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(120)))
    # diagonal motion streaks
    st = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    for i, (x0, col, a, wd) in enumerate([(-200, CYAN, 70, 3), (200, PINK, 60, 2), (700, CYAN, 40, 2),
                                          (1100, PINK, 55, 3), (1500, CYAN, 45, 2)]):
        sd.line((x0, H*0.1, x0 + 900, H), fill=col + (a,), width=wd)
    img = Image.alpha_composite(img, st.filter(ImageFilter.GaussianBlur(2)))
    return img


def neon_text(base, text, font, y, fill, glow, cx=None, chroma=6):
    """Centered neon text with chromatic offset + glow."""
    d = ImageDraw.Draw(base); tw = d.textlength(text, font=font)
    x = (W - tw) / 2 if cx is None else cx
    bb = font.getbbox(text)
    halo = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).text((x, y), text, font=font, fill=glow + (200,))
    base.alpha_composite(halo.filter(ImageFilter.GaussianBlur(18)))
    d.text((x - chroma, y), text, font=font, fill=CYAN + (150,))     # chromatic ghost
    d.text((x + chroma, y), text, font=font, fill=(255, 20, 147, 150))
    d.text((x, y), text, font=font, fill=fill + (255,))
    return bb[3] - bb[1]


def shard(path, size, angle):
    im = Image.open(path).convert("RGBA").resize((size, size))
    b = Image.new("RGBA", (size + 12, size + 12), (0, 0, 0, 0))
    ImageDraw.Draw(b).rectangle((0, 0, size + 11, size + 11), fill=CYAN + (255,))
    b.alpha_composite(im, (6, 6))
    return b.rotate(angle, expand=True, resample=Image.BICUBIC)


def main():
    img = canvas()

    # hero — full-width, lower-centred, top faded into void
    hero = Image.open(HERE / "hero.png").convert("RGBA")
    hw = 1560; hero = hero.resize((hw, hw))
    fade = Image.new("L", (hw, hw), 255); fd = ImageDraw.Draw(fade)
    for yy in range(300):
        fd.line((0, yy, hw, yy), fill=int(255 * (yy / 300)))
    hero.putalpha(Image.composite(hero.split()[3], Image.new("L", (hw, hw), 0), fade))
    img.alpha_composite(hero, ((W - hw) // 2, 700))

    # episode-art shards (dynamic "transmission fragments")
    img.alpha_composite(shard(EP / "ep08.jpg", 250, 11), (40, 1760))
    img.alpha_composite(shard(EP / "ep16.jpg", 250, -9), (1290, 1720))
    img.alpha_composite(shard(EP / "ep28.jpg", 220, 7), (60, 2050))

    d = ImageDraw.Draw(img)
    # kicker
    kf = fnt("JetBrainsMono-700.ttf", 32)
    kt = "A FULL-CAST AUDIO DRAMA"
    d.text(((W - d.textlength(kt, font=kf)) / 2, 96), kt, font=kf, fill=CYAN + (255,))

    # title lockup
    t1f = fit(d, "THE LAST HUMAN", "Orbitron-900.ttf", 150, W - 150)
    t2f = fnt("Orbitron-900.ttf", 250)
    while d.textlength("CEO", font=t2f) > W - 150: t2f = fnt("Orbitron-900.ttf", t2f.size - 4)
    neon_text(img, "THE LAST HUMAN", t1f, 170, PAPER, PINK)
    neon_text(img, "CEO", t2f, 300, PAPER, PINK, chroma=9)
    d = ImageDraw.Draw(img)

    # author + tagline
    af = fnt("Orbitron-700.ttf", 62)
    d.text(((W - d.textlength("SPACE PIRATE ZERO", font=af)) / 2, 2250), "SPACE PIRATE ZERO", font=af, fill=PAPER + (255,))
    tf = fnt("JetBrainsMono-400.ttf", 30)
    tag = "SUCCESSION  ×  FLOWERS FOR ALGERNON  ·  SIGNAL FINDS SIGNAL"
    tf = fit(d, tag, "JetBrainsMono-400.ttf", 30, W - 120)
    d.text(((W - d.textlength(tag, font=tf)) / 2, 2330), tag, font=tf, fill=CYAN + (255,))

    # SECOND EDITION badge — centered pill in the gap below the title
    ef = fnt("Orbitron-700.ttf", 46)
    et = "SECOND EDITION"
    pad = 46; tw = int(ef.getlength(et)); bw, bh = tw + pad * 2, 96
    badge = Image.new("RGBA", (bw + 80, bh + 80), (0, 0, 0, 0)); bd = ImageDraw.Draw(badge)
    glow = Image.new("RGBA", badge.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle((40, 40, 40 + bw, 40 + bh), radius=bh // 2, fill=PINK + (180,))
    badge.alpha_composite(glow.filter(ImageFilter.GaussianBlur(22)))
    bd.rounded_rectangle((40, 40, 40 + bw, 40 + bh), radius=bh // 2, fill=PINK + (255,))
    bd.rounded_rectangle((40, 40, 40 + bw, 40 + bh), radius=bh // 2, outline=CYAN + (255,), width=4)
    bd.text((40 + pad, 40 + (bh - (ef.getbbox(et)[3] - ef.getbbox(et)[1])) // 2 - ef.getbbox(et)[1]),
            et, font=ef, fill=(10, 2, 8, 255))
    badge = badge.rotate(-2.5, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(badge, ((W - badge.width) // 2, 560))

    out = HERE / "the_last_human_ceo_2nd_edition_cover.png"
    img.convert("RGB").save(out, quality=95)
    print(f"saved {out}  ({W}x{H})")


if __name__ == "__main__":
    main()
