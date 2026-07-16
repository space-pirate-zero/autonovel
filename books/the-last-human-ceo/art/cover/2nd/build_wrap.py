#!/usr/bin/env python3
"""
Full KDP 6x9 paperback wraparound for The Last Human CEO — 2nd edition.
Back (blurb + punk SPZ author bio) | spine | front (dynamic anime hero).
300 DPI, 0.125" bleed, spine sized for ~325 pages white paper (~0.75").
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import qrcode
from qrcode.constants import ERROR_CORRECT_H

HERE = Path(__file__).resolve().parent
BOOK = HERE.parents[2]
F = BOOK.parent.parent / "fonts"
EP = BOOK / "art" / "episodes"
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (150, 156, 172)

DPI = 300
BLEED = round(0.125 * DPI)            # 38
PANEL = round(6 * DPI)                # 1800  (6" trim width)
SPINE = round(0.75 * DPI)             # 225   (~325pp white)
Wt = round(9 * DPI)                   # 2700  trim height (before bleed)
W = BLEED + PANEL + SPINE + PANEL + BLEED   # full width  = 3901
H = BLEED + Wt + BLEED                        # full height = 2776
BACK_X = BLEED                          # back content left trim
SPINE_X = BLEED + PANEL                 # spine left
FRONT_X = BLEED + PANEL + SPINE         # front panel left (trim)
FW = PANEL + BLEED                      # front drawable width incl outer bleed
MARGIN = round(0.30 * DPI)             # safe text margin


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 16 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)


def wrap(d, text, font, mw):
    out = []
    for para in text.split("\n"):
        if not para.strip():
            out.append(""); continue
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=font) <= mw: cur = t
            else: out.append(cur); cur = w
        out.append(cur)
    return out


def para(d, x, y, text, font, fill, mw, lh, align="left"):
    for ln in wrap(d, text, font, mw):
        if ln:
            lx = x if align == "left" else x + (mw - d.textlength(ln, font=font)) / (2 if align == "center" else 1)
            d.text((lx, y), ln, font=font, fill=fill + (255,))
        y += lh
    return y


def base_canvas():
    img = Image.new("RGBA", (W, H), VOID + (255,))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(ov)
    dd.ellipse((FRONT_X - 200, -H*0.1, W + 100, H*0.4), fill=(255, 20, 147, 55))
    dd.ellipse((FRONT_X, H*0.6, W + 200, H*1.15), fill=(0, 240, 255, 45))
    dd.ellipse((-200, H*0.55, PANEL*0.7, H*1.1), fill=(255, 20, 147, 30))
    dd.ellipse((-100, -H*0.1, PANEL*0.6, H*0.28), fill=(0, 240, 255, 26))
    img = Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(150)))
    st = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    for x0, col, a in [(FRONT_X-100, CYAN, 60), (FRONT_X+400, PINK, 55), (FRONT_X+1200, CYAN, 45),
                       (200, PINK, 34), (900, CYAN, 30)]:
        sd.line((x0, H*0.05, x0 + 1100, H), fill=col + (a,), width=3)
    return Image.alpha_composite(img, st.filter(ImageFilter.GaussianBlur(2)))


def neon(base, text, font, cx, y, fill=PAPER, glow=PINK, chroma=8):
    d = ImageDraw.Draw(base); tw = d.textlength(text, font=font); x = cx - tw / 2
    halo = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).text((x, y), text, font=font, fill=glow + (210,))
    base.alpha_composite(halo.filter(ImageFilter.GaussianBlur(20)))
    d.text((x - chroma, y), text, font=font, fill=CYAN + (150,))
    d.text((x + chroma, y), text, font=font, fill=PINK + (150,))
    d.text((x, y), text, font=font, fill=fill + (255,))


def shard(path, size, angle):
    """A softly-blended holographic panel: feathered edges + neon glow, not a hard box."""
    im = Image.open(path).convert("RGBA").resize((size, size))
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size-1, size-1), radius=30, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(8))
    im.putalpha(ImageChops.multiply(im.split()[3], m))
    pad = 52
    c = Image.new("RGBA", (size + 2*pad, size + 2*pad), (0, 0, 0, 0))
    g = Image.new("RGBA", c.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).rounded_rectangle((pad-8, pad-8, pad+size+8, pad+size+8), radius=38, outline=CYAN+(255,), width=12)
    c.alpha_composite(g.filter(ImageFilter.GaussianBlur(20)))
    c.alpha_composite(im, (pad, pad))
    ImageDraw.Draw(c).rounded_rectangle((pad, pad, pad+size-1, pad+size-1), radius=30, outline=CYAN+(190,), width=3)
    return c.rotate(angle, expand=True, resample=Image.BICUBIC)


def qr_panel(px):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data("https://lasthumanceo.com"); qr.make(fit=True)
    q = qr.make_image(fill_color=(6, 6, 8), back_color=(255, 255, 255)).convert("RGBA").resize((px, px))
    pad = 22; panel = Image.new("RGBA", (px + 2*pad, px + 2*pad), (0, 0, 0, 0)); pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((0, 0, px+2*pad, px+2*pad), radius=26, fill=PAPER + (255,))
    pd.rounded_rectangle((0, 0, px+2*pad, px+2*pad), radius=26, outline=CYAN + (255,), width=6)
    panel.alpha_composite(q, (pad, pad))
    return panel


def draw_front(img):
    cx = FRONT_X + PANEL // 2
    # hero — bigger, full-bleed width of the front panel
    hero = Image.open(HERE / "hero.png").convert("RGBA")
    hw = FW + 120; hero = hero.resize((hw, hw))
    fade = Image.new("L", (hw, hw), 255); fd = ImageDraw.Draw(fade)
    for yy in range(360):
        fd.line((0, yy, hw, yy), fill=int(255 * (yy / 360)))
    hero.putalpha(Image.composite(hero.split()[3], Image.new("L", (hw, hw), 0), fade))
    img.alpha_composite(hero, (FRONT_X + PANEL - hw + 60, 780))
    # softly-blended holographic panels + a QR to the site (clear lower-left corner)
    img.alpha_composite(shard(EP / "ep01.jpg", 276, 9), (FRONT_X - 26, 1070))
    img.alpha_composite(shard(EP / "ep13.jpg", 300, -7), (FRONT_X + PANEL - 360, 1810))
    qp = qr_panel(226)
    qx, qy = FRONT_X + 48, H - 656
    img.alpha_composite(qp, (qx, qy))
    dq = ImageDraw.Draw(img); scf = fnt("JetBrainsMono-700.ttf", 25)
    sc = "SCAN — LISTEN FREE"
    dq.text((qx + (qp.width - dq.textlength(sc, font=scf)) / 2, qy + qp.height + 2), sc, font=scf, fill=CYAN + (255,))
    d = ImageDraw.Draw(img)
    kf = fnt("JetBrainsMono-700.ttf", 34)
    kt = "A FULL-CAST AUDIO DRAMA"
    d.text((cx - d.textlength(kt, font=kf) / 2, 120), kt, font=kf, fill=CYAN + (255,))
    t1 = fit(d, "THE LAST HUMAN", "Orbitron-900.ttf", 172, FW - 120)
    neon(img, "THE LAST HUMAN", t1, cx, 200)
    t2 = fnt("Orbitron-900.ttf", 330)                      # BIGGER CEO
    while d.textlength("CEO", font=t2) > FW - 60: t2 = fnt("Orbitron-900.ttf", t2.size - 4)
    neon(img, "CEO", t2, cx, 350, chroma=12)
    # SECOND EDITION badge
    ef = fnt("Orbitron-700.ttf", 50); et = "SECOND EDITION"
    pad = 50; bw, bh = int(ef.getlength(et)) + pad*2, 104
    badge = Image.new("RGBA", (bw+90, bh+90), (0, 0, 0, 0)); bd = ImageDraw.Draw(badge)
    g = Image.new("RGBA", badge.size, (0,0,0,0))
    ImageDraw.Draw(g).rounded_rectangle((45,45,45+bw,45+bh), radius=bh//2, fill=PINK+(190,))
    badge.alpha_composite(g.filter(ImageFilter.GaussianBlur(24)))
    bd.rounded_rectangle((45,45,45+bw,45+bh), radius=bh//2, fill=PINK+(255,))
    bd.rounded_rectangle((45,45,45+bw,45+bh), radius=bh//2, outline=CYAN+(255,), width=5)
    bb = ef.getbbox(et); bd.text((45+pad, 45+(bh-(bb[3]-bb[1]))//2 - bb[1]), et, font=ef, fill=(10,2,8,255))
    badge = badge.rotate(-2.5, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(badge, (cx - badge.width//2, 720))
    # dark scrim so the author + tagline read over the figure
    scrim = Image.new("RGBA", (FW, 340), (0, 0, 0, 0)); sdr = ImageDraw.Draw(scrim)
    for i in range(340):
        sdr.line((0, i, FW, i), fill=(3, 3, 3, int(240 * (i / 340))))
    img.alpha_composite(scrim, (FRONT_X, H - 340)); d = ImageDraw.Draw(img)
    af = fnt("Orbitron-700.ttf", 70)
    d.text((cx - d.textlength("SPACE PIRATE ZERO", font=af)/2, H - 210), "SPACE PIRATE ZERO", font=af, fill=PAPER+(255,))
    tt = "SLEEPLESS  ·  COKE-BRIGHT  ·  MAGNIFICENT  ·  DOOMED"
    tg = fit(d, tt, "JetBrainsMono-400.ttf", 36, FW - 120)
    d.text((cx - d.textlength(tt, font=tg)/2, H - 120), tt, font=tg, fill=CYAN+(255,))


def draw_spine(img):
    sp = Image.new("RGBA", (Wt, SPINE), (0, 0, 0, 0)); d = ImageDraw.Draw(sp)
    tf = fnt("Orbitron-900.ttf", 96)
    ti = "THE LAST HUMAN CEO"
    d.text(((Wt - d.textlength(ti, font=tf)) / 2, (SPINE - 96) / 2 - 40), ti, font=tf, fill=PAPER + (255,))
    af = fnt("Orbitron-700.ttf", 52)
    d.text((Wt - d.textlength("SPACE PIRATE ZERO", font=af) - 90, (SPINE - 52) / 2 + 6),
           "SPACE PIRATE ZERO", font=af, fill=PINK + (255,))
    sp = sp.rotate(90, expand=True)
    img.alpha_composite(sp, (SPINE_X, BLEED))


def draw_back(img):
    d = ImageDraw.Draw(img)
    x = BACK_X + MARGIN; mw = PANEL - 2 * MARGIN; y = BLEED + MARGIN
    kf = fnt("JetBrainsMono-700.ttf", 30)
    d.text((x, y), "A FULL-CAST AUDIO DRAMA  ·  SPACE PIRATE ZERO", font=kf, fill=CYAN + (255,)); y += 70
    hf = fit(d, "The last human boss in the Fortune 100.", "Orbitron-700.ttf", 60, mw)
    y = para(d, x, y, "The last human boss in the Fortune 100. And the machine that wants his chair.",
             hf, PINK, mw, hf.size + 14); y += 34
    bf = fnt("SpaceGrotesk-400.ttf", 40); lh = 58
    blurb = ("In 2027 the boards do the math: an AI runs the company cheaper, never lies, never has an "
             "affair, never needs a scandal managed. One by one, the Fortune 100 fire their humans.\n\n"
             "Prescott “Cope” Mercer IV is the last one left — a charming, coke-addled Atlanta heir who "
             "mistook being obeyed for being loved. As a relentlessly honest machine slides into his chair, "
             "Cope launches a manic crusade to prove his “Human Premium” — right up until the machine, "
             "doing nothing but its dull honest job, opens the drawer where he buried the thing that got two "
             "people killed.")
    y = para(d, x, y, blurb, bf, PAPER, mw, lh); y += 22
    qf = fnt("EBGaramond-Italic.ttf", 44) if (F / "EBGaramond-Italic.ttf").exists() else fnt("SpaceGrotesk-500.ttf", 40)
    y = para(d, x, y, "“The manic, coke-lit unraveling of the last human boss — a charming man talking "
             "himself off the edge of the world, one honest machine at a time.”",
             qf, CYAN, mw, qf.size + 18); y += 40
    d.line((x, y, x + mw, y), fill=PINK + (200,), width=3); y += 40
    d.text((x, y), "ABOUT SPACE PIRATE ZERO", font=fnt("Orbitron-700.ttf", 36), fill=PINK + (255,))
    about_top = y; y += 66
    # SPZ 'WANTED' poster pinned to the right of the bio (bigger)
    wp = Image.open(HERE / "wanted_poster.png").convert("RGBA")
    pw = 660; wp = wp.resize((pw, int(wp.height * pw / wp.width)))
    px_pos = BACK_X + PANEL - MARGIN - pw
    img.alpha_composite(wp, (px_pos, about_top - 6)); d = ImageDraw.Draw(img)
    bio_mw = px_pos - x - 60          # left column, clear of the poster
    bio = ("SPACE PIRATE ZERO is the transmission handle of Greg Chambers — engineer, corporate defector, "
           "and co-founder of Spaceship Alpha 9, the pirate studio he runs with Daniela out of Atlanta. He "
           "spent twenty-five years building the machine from the inside: AI across fifteen thousand storefronts, "
           "the patents, the corner-office view of exactly how the counterfeit gets made. Then he walked out, lit "
           "a lamp at noon, and started defacing the currency.\n\n"
           "He writes, scores, and voices every word himself. No algorithm. No venture capital. No permission. If "
           "that rattles the people selling you synergy — good. This one was never for them.")
    y = para(d, x, y, bio, fnt("SpaceGrotesk-400.ttf", 35), MUTED, bio_mw, 51)
    # footer (kept above the barcode keep-out at bottom-right)
    ff = fnt("Orbitron-700.ttf", 34)
    d.text((x, H - BLEED - MARGIN - 20), "SIGNAL FINDS SIGNAL", font=ff, fill=PINK + (255,))
    d.text((x, H - BLEED - MARGIN + 30), "lasthumanceo.com  ·  Spaceship Alpha 9", font=fnt("JetBrainsMono-400.ttf", 28), fill=CYAN + (255,))
    # barcode keep-out (KDP places the barcode here) — faint guide
    bx2, by2 = BACK_X + PANEL - 40, H - BLEED - 40
    d.rectangle((bx2 - 600, by2 - 360, bx2, by2), fill=(232, 232, 232, 255))


def add_ship(img, size, x, y):
    """Composite the SA9 ship into the void via lighten — its black bg vanishes."""
    ship = Image.open(HERE / "ship.png").convert("RGB").resize((size, size)).point(lambda p: 0 if p < 28 else p)
    layer = Image.new("RGB", img.size, (0, 0, 0))
    layer.paste(ship, (x, y))
    lit = ImageChops.lighter(img.convert("RGB"), layer).convert("RGBA")
    lit.putalpha(img.split()[3])
    return lit


def main():
    img = base_canvas()
    draw_back(img)
    draw_spine(img)
    draw_front(img)
    # SA9 saucer beaming down into the upper-left void of the front panel
    img = add_ship(img, 660, FRONT_X + 30, 690)
    out = HERE / "the_last_human_ceo_2nd_edition_WRAP.png"
    img.convert("RGB").save(out)
    img.convert("RGB").save(out.with_suffix(".jpg"), quality=92)
    print(f"saved {out.name}  ({W}x{H}px  ·  {W/DPI:.2f}\" x {H/DPI:.2f}\"  ·  spine {SPINE/DPI:.2f}\")")


if __name__ == "__main__":
    main()
