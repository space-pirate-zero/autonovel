#!/usr/bin/env python3
"""
Die-cut sticker for The Last Human CEO — SA9 ship + QR to the site + tagline.
Outputs a transparent-background die-cut PNG (+ a white-bg proof).
Run: uv run --with pillow --with qrcode python3 art/cover/2nd/build_sticker.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import qrcode
from qrcode.constants import ERROR_CORRECT_H

HERE = Path(__file__).resolve().parent
BOOK = HERE.parents[2]
F = BOOK.parent.parent / "fonts"
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (150, 156, 172)
SZ = 1500; R = 120
URL = "https://lasthumanceo.com"


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 14 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)
def ctext(d, y, t, font, fill):
    d.text(((SZ - d.textlength(t, font=font)) / 2, y), t, font=font, fill=fill + (255,))


def qr_panel(px):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=12, border=2)
    qr.add_data(URL); qr.make(fit=True)
    q = qr.make_image(fill_color=(6, 6, 8), back_color=(255, 255, 255)).convert("RGBA").resize((px, px))
    pad = 34; panel = Image.new("RGBA", (px + 2*pad, px + 2*pad), (0, 0, 0, 0)); pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((0, 0, px + 2*pad, px + 2*pad), radius=40, fill=PAPER + (255,))
    pd.rounded_rectangle((0, 0, px + 2*pad, px + 2*pad), radius=40, outline=CYAN + (255,), width=8)
    panel.alpha_composite(q, (pad, pad))
    return panel


def main():
    img = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0))
    # rounded body + glow
    body = Image.new("RGBA", (SZ, SZ), VOID + (255,))
    ov = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.ellipse((-SZ*0.2, -SZ*0.15, SZ*0.6, SZ*0.35), fill=(255, 20, 147, 70))
    od.ellipse((SZ*0.45, SZ*0.6, SZ*1.2, SZ*1.2), fill=(0, 240, 255, 60))
    body = Image.alpha_composite(body, ov.filter(ImageFilter.GaussianBlur(120)))
    mask = Image.new("L", (SZ, SZ), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, SZ-1, SZ-1), radius=R, fill=255)
    img.paste(body, (0, 0), mask)

    # ship (lighten onto void — crush its near-black bg to pure 0 so no box shows)
    ship = Image.open(HERE / "ship.png").convert("RGB").resize((940, 940)).point(lambda p: 0 if p < 28 else p)
    layer = Image.new("RGB", (SZ, SZ), (0, 0, 0)); layer.paste(ship, (280, 120))
    lit = ImageChops.lighter(img.convert("RGB"), layer).convert("RGBA"); lit.putalpha(img.split()[3]); img = lit

    d = ImageDraw.Draw(img)
    ctext(d, 96, "SPACESHIP ALPHA 9  ·  TRANSMITTING", fnt("JetBrainsMono-700.ttf", 34), CYAN)

    # title + tagline
    tf = fit(d, "THE LAST HUMAN CEO", "Orbitron-900.ttf", 108, SZ - 220)
    halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).text(((SZ - d.textlength("THE LAST HUMAN CEO", font=tf)) / 2, 680),
                              "THE LAST HUMAN CEO", font=tf, fill=PINK + (220,))
    img.alpha_composite(halo.filter(ImageFilter.GaussianBlur(16))); d = ImageDraw.Draw(img)
    ctext(d, 680, "THE LAST HUMAN CEO", tf, PAPER)
    gf = fit(d, "THE MACHINE WANTS YOUR CHAIR.", "Orbitron-700.ttf", 52, SZ - 240)
    ctext(d, 806, "THE MACHINE WANTS YOUR CHAIR.", gf, PINK)

    # scan CTA + QR
    ctext(d, 906, "SCAN  &  LISTEN  FREE", fnt("Orbitron-700.ttf", 42), CYAN)
    panel = qr_panel(300)
    px = (SZ - panel.width) // 2
    img.alpha_composite(panel, (px, 984))
    # arrow chevrons pointing at the QR
    ad = ImageDraw.Draw(img)
    for cxp in (px - 70, px + panel.width + 70):
        ad.polygon([(cxp - 22, 1120), (cxp + 22, 1120), (cxp, 1156)], fill=CYAN + (255,))
    d = ImageDraw.Draw(img)
    ctext(d, 1372, "lasthumanceo.com", fnt("JetBrainsMono-700.ttf", 40), PINK)

    # die-cut kiss border ring
    ImageDraw.Draw(img).rounded_rectangle((26, 26, SZ-27, SZ-27), radius=R-16, outline=CYAN + (255,), width=10)
    ImageDraw.Draw(img).rounded_rectangle((44, 44, SZ-45, SZ-45), radius=R-30, outline=PINK + (160,), width=4)

    # ensure fully transparent outside the die shape
    img.putalpha(ImageChops.multiply(img.split()[3], mask))

    out = HERE / "the_last_human_ceo_sticker_diecut.png"
    img.save(out)
    proof = Image.new("RGBA", (SZ, SZ), (255, 255, 255, 255)); proof.alpha_composite(img)
    proof.convert("RGB").save(HERE / "the_last_human_ceo_sticker_proof.jpg", quality=92)
    print(f"saved {out.name} (transparent die-cut) + proof.jpg  ·  {SZ}x{SZ}  ·  QR -> {URL}")


if __name__ == "__main__":
    main()
