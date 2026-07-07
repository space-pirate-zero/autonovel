#!/usr/bin/env python3
"""
Build art/tabloids/tabloids.pdf: ten fake vintage scandal-magazine covers
charting Cope Mercer's downfall, one per headline. Photos are Gemini
halftone assets (art/cover/, art/tabloids/); all type is set live in TikZ
(Impact / Arial Black / American Typewriter), so there are no AI text
glitches.

Run:  python3 typeset/build_tabloids.py   (writes .tex and compiles via tectonic)
"""
import os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "art", "tabloids")

PW, PH = 8.5, 11.0

def p(v): return f"{v:.4f}"
def pt(x, y): return "(" + p(x) + "," + p(y) + ")"


import re as _re

def _plain(s):
    s = _re.sub(r"\\[a-zA-Z]+\{?\}?", "", s)
    return s.replace("{", "").replace("}", "").replace("$", "")

def fit(text, size, budget_in):
    """Shrink size so a single Impact line fits budget_in (rough 0.46em/char)."""
    n = max(1, len(_plain(text)))
    cap = budget_in * 72.0 / (0.46 * n)
    return min(size, cap)


def node(L, x, y, rot, color, font, size, lead, text, width=None,
         fill=None, border=None, sep="4pt", anchor=None, align="center"):
    opts = [f"rotate={rot}", f"text={color}", f"align={align}", f"inner sep={sep}"]
    if width: opts.append(f"text width={width}in")
    if fill: opts.append(f"fill={fill}")
    if border: opts.append(f"draw={border},line width=1pt")
    if anchor: opts.append(f"anchor={anchor}")
    L.append(r"\node[" + ",".join(opts) + "] at " + pt(x, y)
             + r" {" + font + r"\fontsize{" + str(size) + "}{" + str(lead)
             + r"}\selectfont " + text + r"};")


def burst(L, x, y, rot, size_in, fill, color, fsize, text):
    L.append(r"\node[star,star points=12,star point ratio=1.55,rotate=" + str(rot)
             + r",minimum size=" + p(size_in) + r"in,fill=" + fill
             + r",draw=inkblack,line width=0.8pt,text=" + color
             + r",align=center] at " + pt(x, y)
             + r" {\ablack\fontsize{" + str(fsize) + "}{" + str(fsize)
             + r"}\selectfont " + text + r"};")


def photo(L, path, x, y, rot, width):
    L.append(r"\node[rotate=" + str(rot) + "] at " + pt(x, y)
             + r" {\includegraphics[width=" + p(width) + "in]{" + path + r"}};")


def page(L, spec):
    """One cover. spec keys: masthead, tagline, dateline, scheme(band,
    bandtext, accent), layout(A/B), photo(path,w,x,y,rot), kicker, main
    (list of (text,size,color)), deck, chips [(x,y,rot,fill,color,size,w,
    text,border)], bursts [(x,y,rot,d,fill,color,size,text)], bottom,
    caption."""
    L.append(r"\begin{tikzpicture}[x=1in,y=1in,every node/.style={inner sep=0pt,outer sep=0pt}]")
    L.append(r"\fill[paperw] " + pt(0, 0) + " rectangle " + pt(PW, PH) + ";")
    L.append(r"\node[anchor=south west] at " + pt(0, 0)
             + r" {\includegraphics[width=" + p(PW) + "in,height=" + p(PH)
             + r"in]{../cover/paper_bg.png}};")

    band, bandtext, accent = spec["scheme"]

    # photo behind the type
    ph = spec["photo"]
    photo(L, ph["path"], ph["x"], ph["y"], ph["rot"], ph["w"])
    if spec.get("caption"):
        cx, cy, ctext = spec["caption"]
        node(L, cx, cy, ph["rot"] / 2, "inkblack", r"\atype", 8, 9.6, ctext,
             width=2.4, fill="paperw", border="inkblack", sep="3.5pt")

    # masthead band
    L.append(r"\fill[" + band + "] " + pt(0, PH-1.55) + " rectangle " + pt(PW, PH) + ";")
    msize = fit(spec["masthead"], 64, 7.3)
    node(L, PW/2, PH-0.78, 0, bandtext, r"\impact", round(msize, 1), round(msize, 1),
         spec["masthead"])
    node(L, PW/2, PH-1.36, 0, bandtext, r"\arial\bfseries\itshape", 10.5, 11,
         spec["tagline"])
    node(L, 0.92, PH-1.36, 0, bandtext, r"\atype", 9, 9, spec["dateline"][0],
         anchor="west", align="left")
    node(L, PW-0.92, PH-1.36, 0, bandtext, r"\atype", 9, 9, spec["dateline"][1],
         anchor="east", align="right")

    # kicker strip under masthead
    if spec.get("kicker"):
        L.append(r"\fill[" + accent + "] " + pt(0, PH-2.10) + " rectangle " + pt(PW, PH-1.62) + ";")
        node(L, PW/2, PH-1.86, 0, "paperw", r"\impact", 16, 17, spec["kicker"])

    # main headline block
    mx, my = spec["main_xy"]
    anchor = "west" if spec.get("main_align", "left") == "left" else None
    yy = my
    for text, size, color, width in spec["main"]:
        s = round(fit(text, size, width), 1)
        node(L, mx, yy, spec.get("main_rot", 0), color, r"\impact",
             s, s, text, anchor=anchor)
        yy -= (s + 9) / 72.0
    if spec.get("deck"):
        dx, dy, dtext = spec["deck"]
        node(L, dx, dy, 0, "inkblack", r"\arial\bfseries\itshape", 12, 14,
             dtext, width=3.6, align="left", anchor=anchor)

    for c in spec.get("chips", []):
        x, y, rot, fill, color, size, w, text, *rest = c
        node(L, x, y, rot, color, r"\impact", size, size + 1.5, text,
             width=w, fill=fill, border=(rest[0] if rest else None))

    for b in spec.get("bursts", []):
        burst(L, *b)

    # bottom strip
    L.append(r"\fill[inkblack] " + pt(0, 0) + " rectangle " + pt(PW, 0.52) + ";")
    node(L, PW/2, 0.27, 0, "paperw", r"\impact", 13.5, 14, spec["bottom"])

    L.append(r"\pgfresetboundingbox\path " + pt(0, 0) + " rectangle " + pt(PW, PH) + ";")
    L.append(r"\end{tikzpicture}")


C = "../cover/"
T = ""  # tabloids dir itself

COVERS = [
 # 1 — the thesis smear
 dict(masthead="BOARDROOM CONFIDENTIAL",
      tagline="UNCENSORED AND OFF THE RECORD",
      dateline=("VOL. XCV", r"AUG. 2027 \textbullet{} 35\textcent"),
      scheme=("inkyellow", "inkblack", "inkred"),
      kicker=r"THE SALARY THEY DARED NOT PRINT \textemdash{} UNTIL NOW!",
      photo=dict(path=C+"cope_toast.png", w=4.35, x=5.85, y=4.55, rot=-3),
      caption=(5.85, 1.95, r"Mercer toasts at the Conrad Vance. The bow tie is his own work."),
      main_xy=(0.55, 7.95), main_align="left",
      main=[("\\$29 MILLION", 52, "inkred", 3.4),
            ("A YEAR", 52, "inkred", 3.4),
            ("FOR A SOUL?", 52, "inkblack", 3.4)],
      deck=(0.55, 5.55, r"The board asked what the `vision thing' actually costs. Our accountants answer \textemdash{} line by line, affair by affair."),
      chips=[(1.75, 4.45, -4, "inkred", "paperw", 13, 2.6, "KEY-MAN RISK! THE POLITE WORD FOR A BOMB!"),
             (1.75, 3.35, 3, "paperw", "inkred", 12, 2.6, "ELEVEN SETTLEMENTS, \\$14.2 MILLION, ZERO DISCLOSURES!", "inkblack"),
             (1.75, 2.25, -2, "inkblack", "inkyellow", 12, 2.6, "AND THE MACHINE WORKS FOR ELECTRICITY!")],
      bursts=[(7.45, 7.6, 10, 1.45, "inkred", "paperw", 11, "EXCLUSIVE!")],
      bottom=r"$\star$ ALSO: THE TROPHY THEY GIVE YOU FOR GOING EXTINCT \textemdash{} PAGE 4 $\star$"),

 # 2 — the cocaine
 dict(masthead="HUSH-HUSH",
      tagline="WHAT THE FRONT PAGES WHISPER, WE SAY OUT LOUD",
      dateline=("THE MEN'S ROOM ISSUE", r"NOV. 2027 \textbullet{} 25\textcent"),
      scheme=("inkblue", "paperw", "inkred"),
      kicker=r"FOUR GENERATIONS OF MAYONNAISE \textemdash{} ONE LITTLE FOLDED PAPER!",
      photo=dict(path=T+"cope_mirror.png", w=4.3, x=2.65, y=4.6, rot=2.5),
      caption=(2.65, 2.0, r"Caught through the door at the Greenbrier. He called it `clarity.'"),
      main_xy=(6.65, 7.6), main_align="center",
      main=[("WHAT'S", 44, "inkred", 3.0),
            ("REALLY IN", 44, "inkred", 3.0),
            ("THE PREMIUM", 38, "inkblack", 3.2),
            ("BLEND?", 52, "inkblack", 3.0)],
      deck=(6.65, 4.85, r"Insiders say the chairman's famous 2 a.m. certainty comes with a hundred-dollar straw attached."),
      chips=[(6.65, 3.55, -3, "inkyellow", "inkblack", 13, 2.5, "HE HASN'T SLEPT SINCE TUESDAY!"),
             (6.65, 2.55, 4, "paperw", "inkred", 12, 2.5, "THE DRAWER WITH THE FALSE BACK!", "inkblack")],
      bursts=[(1.0, 7.5, -8, 1.3, "inkyellow", "inkblack", 10, "CENSORED!")],
      bottom=r"PLUS: ARE YOU A KEY-MAN RISK? TAKE OUR TEN-QUESTION TEST \textemdash{} PAGE 22"),

 # 3 — the insomnia
 dict(masthead="INSIDE STORY",
      tagline="THE EYES HAVE IT",
      dateline=("SPECIAL SLEEP ISSUE", r"APR. 2028 \textbullet{} 35\textcent"),
      scheme=("inkred", "paperw", "inkblack"),
      kicker=None,
      photo=dict(path=C+"cope_eyes.png", w=8.9, x=4.25, y=6.05, rot=0),
      caption=(6.5, 4.55, r"Untouched press photo. Eleven days, by his own staff's count."),
      main_xy=(4.25, 3.85), main_align="center", main_rot=-2,
      main=[("HASN'T SLEPT", 58, "inkred", 7.6),
            ("SINCE TUESDAY!", 58, "inkred", 7.6)],
      deck=(4.25, 2.6, r"\textemdash{} but which Tuesday? Aides count the days. He counts the applause. The machine, of course, never has to count at all."),
      chips=[(1.85, 1.55, -4, "inkblack", "inkyellow", 13, 2.7, "PROPHET OF THE ARENA OR PATIENT OF THE YEAR?"),
             (6.35, 1.55, 3, "paperw", "inkred", 13, 2.6, "`THE RIVER NEVER LIES AWAKE!'", "inkblack")],
      bursts=[(7.7, 4.0, 8, 1.35, "inkyellow", "inkblack", 9.5, "12 DAYS\\\\PAST\\\\SLEEP!")],
      bottom=r"DOCTORS ASK: CAN A MAN OUTWORK A THING THAT WAS NEVER TIRED? \textemdash{} PAGE 8"),

 # 4 — the engineered tears
 dict(masthead="TOP SECRET",
      tagline="THE TRUTH ABOUT THE TEARS",
      dateline=("CAMDEN EDITION", r"FEB. 2028 \textbullet{} 35\textcent"),
      scheme=("inkblack", "inkyellow", "inkred"),
      kicker=r"31 MILLION WATCHED HIM CRY \textemdash{} ONE EYE STAYED DRY!",
      photo=dict(path=T+"cope_weep.png", w=5.6, x=5.3, y=5.5, rot=-2),
      caption=(5.3, 3.2, r"Camden, New Jersey. Note which eye found the camera."),
      main_xy=(2.0, 8.0), main_align="left",
      main=[("RENT-", 64, "inkred", 3.2),
            ("A-", 64, "inkred", 3.2),
            ("TEAR!", 64, "inkred", 3.2)],
      deck=(1.9, 4.7, r"\$200,000 a month buys a Hollywood image doctor, a chin-quiver coach, and a rule: `the withheld tear out-performs the tear by twelve points.'"),
      chips=[(1.9, 3.0, -3, "inkyellow", "inkblack", 13, 2.8, "CRYING ON CUE? HIS OWN STAFF CAN'T TELL!"),
             (1.9, 1.9, 2, "paperw", "inkred", 12.5, 2.8, "THE CATHARSIS WAS BUDGETED IN Q3!", "inkblack")],
      bursts=[(7.5, 7.9, -10, 1.4, "inkred", "paperw", 10, "SHAME!")],
      bottom=r"INSIDE: THE FOCUS GROUP THAT SCORED HIS GRIEF \textemdash{} FULL MINUTES, PAGE 11"),

 # 5 — the girl on the plane
 dict(masthead="WHISPER",
      tagline="WHAT THE NIGHT DESK KNOWS",
      dateline=("AIRPORT EXTRA", r"MAY 2028 \textbullet{} 25\textcent"),
      scheme=("inkblack", "paperw", "inkred"),
      kicker=r"SHE FLEW OUT AT DAWN \textemdash{} THE STORY STAYED!",
      photo=dict(path=T+"plane_girl.png", w=4.5, x=2.7, y=4.85, rot=-2),
      caption=(2.7, 2.15, r"Teterboro, 5:40 a.m. The Chairman's office calls it `scheduling.'"),
      main_xy=(6.6, 7.7), main_align="center",
      main=[("GIRL", 72, "inkred", 3.0),
            ("ON A", 58, "inkblack", 3.0),
            ("PLANE!", 72, "inkred", 3.0)],
      deck=(6.6, 4.6, r"Who is Mara V.? Comms staffer vanishes from the org chart while the wronged wife sharpens her fountain pen."),
      chips=[(6.6, 3.3, 3, "inkblue", "paperw", 12.5, 2.5, "EMBEDDED, ALL RIGHT! 12,000 WORDS AND THE HOTEL BED!"),
             (6.6, 2.2, -3, "paperw", "inkred", 12.5, 2.5, "THERE'S ALWAYS A GIRL, SAYS MRS. M.", "inkblack")],
      bursts=[(1.05, 7.85, 8, 1.3, "inkyellow", "inkblack", 10, "CAUGHT!")],
      bottom=r"NEXT WEEK: THE SECOND NAME THE PRESS GOT WRONG \textemdash{} AND WHO PAID FOR IT"),

 # 6 — Margaux
 dict(masthead="PHOTOPLAY CONFESSIONS",
      tagline="THE WIVES GET THE LAST WORD",
      dateline=("GREENWICH EDITION", r"JUNE 2028 \textbullet{} 35\textcent"),
      scheme=("inkred", "paperw", "inkblue"),
      kicker=r"22 YEARS, 9 HOUSES, 1 SENTENCE THAT ENDED IT ALL:",
      photo=dict(path=T+"margaux.png", w=4.4, x=5.85, y=4.7, rot=2),
      caption=(5.85, 2.05, r"Margaux Mercer, at home. She stopped numbering the girls years ago."),
      main_xy=(0.55, 7.7), main_align="left",
      main=[("`THERE WAS", 42, "inkblack", 3.6),
            ("NEVER", 58, "inkred", 3.6),
            ("ANYBODY", 46, "inkred", 3.6),
            ("HOME!'", 58, "inkblack", 3.6)],
      deck=(0.55, 4.6, r"The wife of the last human CEO reads her own divorce petition aloud \textemdash{} `I've known about the drugs since the second decade.'"),
      chips=[(1.85, 3.2, -3, "paperw", "inkred", 13, 2.7, "`YOU DON'T FEEL THE ROOM, COPE. YOU READ IT.'", "inkblack"),
             (1.85, 2.1, 2, "inkblue", "paperw", 12.5, 2.7, "THE ENVELOPE BY THE DOOR \textemdash{} WHAT THE HALL LIGHT SAW!")],
      bursts=[(7.55, 7.75, -8, 1.4, "inkyellow", "inkblack", 9.5, "SHE\\\\KNEW!")],
      bottom=r"ALSO: POTTERY, PATIENCE, AND THE ART OF BEING RIGHT FOR THIRTY YEARS \textemdash{} PAGE 6"),

 # 7 — the eleven minutes
 dict(masthead="THE NATIONAL LEDGER",
      tagline="ESTABLISHED 1845 \textbullet{} THE RECORD REMEMBERS",
      dateline=("DEFIANCE, OHIO", r"SEPT. 2028 \textbullet{} 35\textcent"),
      scheme=("inkblack", "paperw", "inkred"),
      kicker=r"THE RECALL HE PENCILED OUT \textemdash{} THE TOWN THAT PAID FOR IT!",
      photo=dict(path=C+"pinwheel_spot.png", w=4.1, x=5.95, y=4.85, rot=-1.5),
      caption=(5.95, 2.35, r"Sherwood Street, Defiance. Somebody keeps planting it. Nobody knows who."),
      main_xy=(0.55, 7.8), main_align="left",
      main=[("ELEVEN", 56, "inkred", 3.6),
            ("MINUTES ON", 42, "inkblack", 3.6),
            ("A SATURDAY.", 42, "inkblack", 3.6),
            ("TWO", 50, "inkred", 3.6),
            ("FUNERALS.", 50, "inkred", 3.6)],
      deck=(0.55, 4.0, r"March 2021: engineers beg for a recall. July: he gives it eleven minutes and mails a card instead. January: a heater, a bedroom, a mother, a boy."),
      chips=[(1.8, 2.45, -2, "inkblack", "inkyellow", 13, 2.8, "31\\% OF THE CARDS ARRIVED. THE LASKOS' DIDN'T."),
             (1.8, 1.5, 2, "paperw", "inkred", 12.5, 2.8, "`TAKEN HOME TOO SOON' \textemdash{} THE STONE STILL SAYS", "inkblack")],
      bursts=[],
      bottom=r"THE NAMES ARE ON PAGE EIGHT. THEY HAVE ALWAYS BEEN ON PAGE EIGHT."),

 # 8 — the machine
 dict(masthead="COMMERCE GAZETTE",
      tagline="122nd YEAR OF PUBLICATION \textbullet{} NOW WRITTEN PARTLY BY MACHINE",
      dateline=("AUTOMATION DESK", r"OCT. 2028 \textbullet{} 35\textcent"),
      scheme=("inkred", "paperw", "inkblack"),
      kicker=r"IT READ EVERY MEMO EVER FILED \textemdash{} BECAUSE IT COULD NOT DO OTHERWISE!",
      photo=dict(path=C+"machine_board.png", w=5.7, x=4.25, y=5.3, rot=1.5),
      caption=(4.25, 3.0, r"The new chief executive is shown the boardroom. It does not sit."),
      main_xy=(4.25, 2.45), main_align="center",
      main=[("HONEST ROBOT", 52, "inkred", 7.6),
            ("RATS OUT BOSS!", 52, "inkred", 7.6)],
      deck=(4.25, 1.35, r"No vendetta. No leak. No enemy. The thing simply cannot decline to log what it finds \textemdash{} and it found the drawer."),
      chips=[(1.7, 7.0, -3, "inkyellow", "inkblack", 13, 2.6, "CHEAPER THAN A MAN \textemdash{} AND IT CAN'T BE SUBPOENAED!"),
             (6.8, 7.0, 3, "paperw", "inkred", 13, 2.6, "STOCK UP 9\\% THE DAY HE'S DONE!", "inkblack")],
      bursts=[(7.6, 4.6, 8, 1.5, "inkyellow", "inkblack", 9, "IT CANNOT\\\\BE\\\\CHARMED!")],
      bottom=r"EDITORIAL: WE, FOR ONE, WELCOME OUR NEW CHIEF EXECUTIVE \textemdash{} PAGE 2"),

 # 9 — the arena sermon
 dict(masthead="LOWDOWN",
      tagline="EVERY MESSIAH GETS A COVER",
      dateline=("ARENA EXTRA", r"APR. 2028 \textbullet{} 25\textcent"),
      scheme=("inkyellow", "inkblack", "inkred"),
      kicker=r"100,000 STREAMING \textemdash{} AND THE CONFIDENCE MONITOR WEPT!",
      photo=dict(path=C+"cope_rally.png", w=6.2, x=4.25, y=5.45, rot=-2),
      caption=(4.25, 3.05, r"`The river never lies awake.' Neither, lately, does he."),
      main_xy=(4.25, 2.5), main_align="center", main_rot=-1,
      main=[("PROPHET OF", 54, "inkred", 7.8),
            ("THE ARENA!", 54, "inkred", 7.8)],
      deck=(4.25, 1.4, r"Twelve days past sleep, the Mayo Messiah compares himself to the founders, the cathedral-builders, and the weather. The weather declined comment."),
      chips=[(1.6, 7.1, -4, "inkred", "paperw", 12.5, 2.5, "PRESSURED SPEECH OR PENTECOST?"),
             (6.9, 7.1, 4, "paperw", "inkred", 12.5, 2.4, "HE FELT THE ROOM. THE ROOM FELT BACK.", "inkblack")],
      bursts=[(7.75, 4.55, -8, 1.35, "inkred", "paperw", 10, "LIVE!")],
      bottom=r"SCIENCE ASKS: PROPHECY AND MANIA \textemdash{} SAME WAVEFORM? \textemdash{} PAGE 14"),

 # 10 — the sentence
 dict(masthead="EXPOSED!",
      tagline="THE LAST WORD ON THE LAST HUMAN",
      dateline=("FINAL EDITION", r"OCT. 2029 \textbullet{} 35\textcent"),
      scheme=("inkblue", "paperw", "inkred"),
      kicker=r"FROM THE 41st FLOOR TO A LOW BRICK BUILDING OUTSIDE MARION!",
      photo=dict(path=C+"cope_shield.png", w=4.4, x=2.7, y=4.8, rot=-2.5),
      caption=(2.7, 2.05, r"Wilmington courthouse. For once, no comment was the comment."),
      main_xy=(6.6, 7.6), main_align="center",
      main=[("THIRTY", 62, "inkred", 3.2),
            ("MONTHS!", 62, "inkred", 3.2),
            ("IS THAT ALL", 34, "inkblack", 3.2),
            ("THEY COST?", 34, "inkblack", 3.2)],
      deck=(6.6, 4.7, r"Defiance does the arithmetic: a day and a half per day the memo sat in the drawer. Fifteen months per Lasko. The law wanted a body. It did not need much of it."),
      chips=[(6.6, 3.25, -3, "paperw", "inkred", 12.5, 2.5, "HE REFUSED THE ONE TITLE THEY OFFERED!", "inkblack"),
             (6.6, 2.2, 3, "inkblack", "inkyellow", 12.5, 2.5, "THE MACHINE'S LETTER: `NO RESPONSE IS SOUGHT'")],
      bursts=[(1.05, 7.8, -8, 1.35, "inkred", "paperw", 9.5, "GUILTY\\\\PLEA!")],
      bottom=r"AND STILL, ON THE RIVER WALK, THE PINWHEEL TURNS \textemdash{} BACK PAGE, BOTTOM CORNER"),
]


def build():
    os.makedirs(OUT, exist_ok=True)
    L = []
    L.append(r"\documentclass{article}")
    L.append(r"\usepackage[paperwidth=" + p(PW) + "in,paperheight=" + p(PH) + "in,margin=0in]{geometry}")
    L.append(r"\usepackage{fontspec}")
    L.append(r"\setmainfont{EBGaramond-VF.ttf}[Path=../../typeset/fonts/, ItalicFont=EBGaramond-Italic-VF.ttf]")
    L.append(r"\newfontfamily\impact{Impact}[Ligatures=TeX]")
    L.append(r"\newfontfamily\ablack{Arial Black}[Ligatures=TeX]")
    L.append(r"\newfontfamily\arial{Arial}[Ligatures=TeX]")
    L.append(r"\newfontfamily\atype{American Typewriter}[Ligatures=TeX]")
    L.append(r"\usepackage{tikz}\usetikzlibrary{shapes.geometric}")
    L.append(r"\usepackage{xcolor}\usepackage{graphicx}")
    L.append(r"\definecolor{inkred}{HTML}{C0201E}")
    L.append(r"\definecolor{inkyellow}{HTML}{F0C518}")
    L.append(r"\definecolor{inkblue}{HTML}{1E5AA8}")
    L.append(r"\definecolor{inkblack}{HTML}{1A1714}")
    L.append(r"\definecolor{paperw}{HTML}{F0E8D2}")
    L.append(r"\pagestyle{empty}")
    L.append(r"\begin{document}")
    for i, spec in enumerate(COVERS):
        if i:
            L.append(r"\newpage")
        L.append(r"\noindent")
        page(L, spec)
    L.append(r"\end{document}")

    tex = os.path.join(OUT, "tabloids.tex")
    with open(tex, "w") as f:
        f.write("\n".join(L))
    print("wrote", tex)
    subprocess.run(["tectonic", "tabloids.tex"], cwd=OUT, check=True)
    print("wrote", os.path.join(OUT, "tabloids.pdf"))


if __name__ == "__main__":
    build()
