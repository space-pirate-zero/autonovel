#!/usr/bin/env python3
"""
SPZ INTERPOL-style 'WANTED' poster (brand-styled) built around the anime mugshot.
A parody notice for a fictional pirate persona — for the book's back-cover bio.
Outputs wanted_poster.png (transparent-safe RGBA on void).
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

HERE = Path(__file__).resolve().parent
F = HERE.parents[2].parent.parent / "fonts"
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (150, 156, 172); RED = (255, 40, 60)
W, H = 940, 1500


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 12 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)
def ctext(d, y, t, font, fill, cx=W//2):
    d.text((cx - d.textlength(t, font=font)/2, y), t, font=font, fill=fill + (255,))


def main():
    img = Image.new("RGBA", (W, H), VOID + (255,))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.ellipse((-W*0.2, -H*0.05, W*0.7, H*0.25), fill=(255, 20, 147, 45))
    od.ellipse((W*0.4, H*0.72, W*1.3, H*1.15), fill=(0, 240, 255, 40))
    img = Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(90)))
    d = ImageDraw.Draw(img)

    # frame
    d.rectangle((16, 16, W-17, H-17), outline=PINK + (255,), width=6)
    d.rectangle((30, 30, W-31, H-31), outline=CYAN + (150,), width=2)

    # INTERPOL red-notice band
    d.rectangle((30, 30, W-31, 96), fill=RED + (255,))
    ctext(d, 46, "I N T E R P O L   —   R E D   N O T I C E", fnt("JetBrainsMono-700.ttf", 26), (12, 2, 4))

    # WANTED
    halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    wf = fnt("Orbitron-900.ttf", 150)
    hw = d.textlength("WANTED", font=wf)
    ImageDraw.Draw(halo).text(((W-hw)/2, 118), "WANTED", font=wf, fill=PINK + (220,))
    img.alpha_composite(halo.filter(ImageFilter.GaussianBlur(16))); d = ImageDraw.Draw(img)
    ctext(d, 118, "WANTED", wf, PAPER)
    ctext(d, 286, "BY EVERY BOARD IN THE FORTUNE 100", fnt("JetBrainsMono-700.ttf", 24), CYAN)

    # mugshot framed
    mug = Image.open(HERE / "spz_headshot.png").convert("RGB").resize((560, 560))
    mx, my = (W - 560)//2, 340
    d.rectangle((mx-10, my-10, mx+570, my+570), fill=(10, 10, 14, 255), outline=CYAN + (255,), width=5)
    img.paste(mug, (mx, my))
    d = ImageDraw.Draw(img)
    for cxp, cyp, dx, dy in [(mx-10, my-10, 1, 1), (mx+570, my-10, -1, 1), (mx-10, my+570, 1, -1), (mx+570, my+570, -1, -1)]:
        d.line((cxp, cyp, cxp+dx*36, cyp), fill=PINK+(255,), width=6)
        d.line((cxp, cyp, cxp, cyp+dy*36), fill=PINK+(255,), width=6)

    # name + alias
    ctext(d, 930, "SPACE PIRATE ZERO", fnt("Orbitron-700.ttf", 54), PAPER)
    ctext(d, 994, "A.K.A. GREG CHAMBERS  ·  \"THE SIGNAL PIRATE\"", fnt("JetBrainsMono-400.ttf", 26), MUTED)

    # charges
    d.text((70, 1052), "WANTED FOR:", font=fnt("Orbitron-700.ttf", 30), fill=PINK + (255,))
    charges = [
        "Piracy of the public airwaves",
        "Defacing the counterfeit currency",
        "Broadcasting the truth without a license",
        "Running Spaceship Alpha 9 without permission",
        "Making things the slow, human way",
    ]
    cf = fnt("SpaceGrotesk-500.ttf", 29); y = 1100
    for c in charges:
        d.polygon([(80, y + 8), (80, y + 27), (99, y + 17)], fill=CYAN + (255,))
        d.text((118, y), c, font=cf, fill=PAPER + (255,)); y += 45

    # caution band + reward
    d.rectangle((30, 1352, W-31, 1414), fill=PINK + (255,))
    ctext(d, 1368, "CONSIDERED ARMED, CHARMING & UNREPENTANT", fnt("Orbitron-700.ttf", 26), (10, 2, 8))
    ctext(d, 1436, "REWARD: YOUR ATTENTION  ·  LASTHUMANCEO.COM", fnt("JetBrainsMono-700.ttf", 24), CYAN)

    out = HERE / "wanted_poster.png"
    img.convert("RGB").save(out, quality=95)
    print(f"saved {out.name}  ({W}x{H})")


if __name__ == "__main__":
    main()
