#!/usr/bin/env python3
"""
gen_episode_art.py — anime-style per-episode cover art for The Last Human CEO,
in the SPZ brand palette, via Gemini Nano Banana (imagegen skill's generate.py).

One reusable STYLE block + a Cope character sheet keep the look consistent; only
the per-episode SCENE changes. Cope visibly decays across the acts. Dark chapters
are kept symbolic / non-graphic.

Env:
  GEMINI_API_KEY   (required)
  GEN              path to the imagegen generate.py (required)
  FORCE=1          regenerate even if epNN.png exists

Usage (from the book dir), source the parent .env first:
  set -a; . /Users/gregchambers/autonovel/.env; set +a
  GEN=".../imagegen/scripts/generate.py" python3 gen_episode_art.py            # all
  GEN=".../generate.py" python3 gen_episode_art.py 2 9                         # a range
"""
import os, sys, subprocess
from pathlib import Path

BASE = Path(__file__).parent
OUT = BASE / "art" / "episodes"
PROMPTS = BASE / "art" / "episodes" / "prompts"
OUT.mkdir(parents=True, exist_ok=True); PROMPTS.mkdir(parents=True, exist_ok=True)
GEN = os.environ.get("GEN", "")

STYLE = (
    "Premium anime key visual, cel-shaded, in the style of a high-end anime Blu-ray "
    "cover / opening-title still. Single strong focal subject, cinematic high-contrast "
    "composition, dramatic negative space. Square 1:1 image.\n\n"
    "COLOR PALETTE (strict): near-black void background #030303. Only two neon accents — "
    "hot magenta #FF1493 and cold cyan #00F0FF — used as rim light, signage glow and "
    "reflections, ALWAYS separated by black void, never blended into each other. Dirty "
    "off-white #E8E8E8 for skin highlights and light; muted slate #8A90A0 for midtones.\n\n"
    "STYLE: industrial-goth cyberpunk noir; clean bold confident linework; flat cel shading "
    "with hard-edged neon rim lighting; subtle VHS scanline and newsprint grain texture; "
    "faint chromatic aberration on the neon edges; moody, glamorous, corporate dread.\n\n"
    "EXCLUDE (critical): render ZERO text of any kind — no signage, no logos, no brand names, "
    "no headlines, no labels, no captions, no UI text, no letters, no numbers, no words, no "
    "watermark, no signature. Any screens, signs, papers or holograms must be BLANK or show "
    "only abstract glowing color and shape. No border or frame. Correct human anatomy, five "
    "fingers per hand. Not photorealistic — anime illustration. Tasteful; no gore; no graphic self-harm."
)

COPE = (
    "CHARACTER — Prescott 'Cope' Mercer IV: a tall American corporate patriarch, mid-50s, "
    "golf-tanned, strong sharp jaw, swept-back silver-and-charcoal hair, piercing pale eyes, "
    "a charismatic showman's smile. Dark tailored suit."
)
# how Cope looks by act (decay)
STATE = {
    1: "He is magnificent and over-bright — performing vitality, wired, a half-second too lit.",
    2: "Manic and coked and fraying — sleepless, over-bright eyes, a sheen of sweat, charm stretched thin.",
    3: "A wreck running on ash — hollow-eyed, gaunt, gray, the tan gone sallow, the armor cracked.",
}
def state_for(n):
    return STATE[1] if n <= 9 else (STATE[2] if n <= 20 else STATE[3])

VIV = ("Vivian 'Viv' Mercer, his estranged daughter: late-20s, sharp, dark hair, guarded, "
       "unimpressed — the one person unmoved by his charm.")
MACHINE = ("THE MACHINE (AURELIUS): not a humanoid robot — an abstract, vast, cold monolithic "
           "presence of cyan light, data-glow and glass, indifferent and patient.")

SCENES = {
    1: "THE GALA TOAST. Cope center-stage at a lavish awards gala lifts a glowing translucent crystal obelisk trophy toward a huge cyan-bokeh chandelier, mid-toast, chin up — magnificent and doomed. A vast dark ballroom of blurred formal guests at candlelit tables recedes into black; one empty reserved chair sits vacant. His face lit hot-magenta from below.",
    2: "DAWN ARRIVAL. 6:40 a.m.; Cope strides alone into the cold glass-and-steel lobby of his limestone corporate tower, immaculate and wired, his reflection multiplied in the dark glass, the building looming indifferent above.",
    3: "THE FILING. Cope in a dark boardroom before a towering wall of ABSTRACT glowing market data — pure cyan and magenta light-streams, bars and shapes with NO readable text or numbers — as a single cold ominous glow signals a machine named as his successor; his showman's smile cracks at the edge.",
    4: "DEFIANCE AT THE TABLE. Cope at the head of an immense empty black boardroom table, chin up defiant; a cold cyan machine-glow waits at the far empty end, facing him down.",
    5: "THE EMPTY MANSION. Cope alone in a vast cold immaculate luxury home at night, dwarfed by the emptiness; a woman's silhouette (his wife) turned away in a distant lit doorway; a faint magenta phone-glow reading numbers.",
    6: "THE HUMAN PREMIUM. Late night, Cope lit hot-magenta and manic, sleepless and electric, a messianic idea igniting around him like neon scripture in the dark — grandiose, over-bright.",
    7: "THE CONSULTANT. A slick wellness-guru in an expensive henley arranges himself languidly in a chair like a scarf, selling sincerity; Cope watches from the shadow, skeptical and hungry.",
    8: "DEFIANCE, GEORGIA. Cope on the floor of an old Southern mayonnaise factory among steel vats and heritage machinery, a shaft of nostalgic gold light cutting the industrial gloom — the past he's mythologizing.",
    9: "THE COVER STORY. A magazine cover shoot: blinding paparazzi flashbulbs and cyan strobes, Cope posed as 'the last human,' famous exactly as he goes extinct — hollow triumph.",
    10: "THE LISTENING TOUR. Cope works a crowd of factory workers, shaking hands at full wattage, performing empathy; the faces around him flat and unmoved, pricing him.",
    11: "HOLLOW WIN. Cope raises a lone toast in an empty penthouse, a poll-line graph rising cyan behind him, the vast house silent and dark — a victory nobody's home for.",
    12: "THE FALSE VICTORY. Cope triumphant under hot studio lights on a TV stage, arms wide, pupils blown; behind the glass a cold machine watches, patient and unimpressed.",
    13: "THE MANIFESTO. Night; Cope in the back seat of a black car at a red light, a phone screen scalding his face as he thumbs a manifesto too fast; city neon streaks outside, a young water-seller's face at the window — luminous and unwell.",
    14: "PRESSURE. Cope engulfed in a towering glowing grid of calendar windows and screens closing in around him, sleepless and cracking, calling the mania 'clarity' — the grid a cage of light.",
    15: "3 A.M. A lone neon-lit hotel room, magenta and cyan bleeding through the blinds, a single suited figure sitting at the edge of the bed, faceless and diminished — an ache of emptiness and self-erasure implied, never shown.",
    16: "RENATA. A haunting: the ghostly translucent figure of a woman from the past, rendered in cold cyan light, stands behind Cope, who cannot bring himself to look — a buried thing surfacing. Guilt, memory.",
    17: "THE NAMES FOR IT. A clinical psychiatrist's office at dusk; Cope slumped in the patient's chair opposite a calm bearded doctor under a cold diagnostic light, the wired armor finally sagging.",
    18: "SWINGING AT THE WALL. 4 a.m.; Cope alone in a stark room throwing a wild punch at a blank wall, knuckles neon-lit, a last desperate idea catching fire — unraveling, spent.",
    19: "FATHER AND DAUGHTER. Cope and Viv face each other across a cold chasm of black void; he reaches, too late; she is already turning away.",
    20: "THE HEARTHSTONE. The reveal: a vast cold monolithic machine presence of cyan light, glass and data — completely BLANK, no lettering or logos — opens a long-buried memory; a glowing ghost-hologram of a mother holding a small child hovers within its light. The dead surfacing. Elegy, dread; non-graphic; absolutely no text.",
    21: "DARK NIGHT. Rock bottom: Cope on a hospital gurney under a flat unflattering cold light, the chemical high finally gone, hollow and human for one clear hour — wrecked, haggard, ash-pale.",
    22: "THE HANDOVER. The machine takes the chair: an empty executive chair bathed in cold cyan light at the head of the table, Cope small and unseated in the shadow beside it — the arithmetic done.",
    23: "NO ONE TO PUNISH. Cope alone in a vast indifferent void, arms open, begging a punishment that will not come — no judge, no cell, only silence and cold light.",
    24: "BREAK INTO THREE. Night; Cope drives alone down a dark highway, face lit by dashboard glow, calm in a way that should scare you; two faint ghost-names ride in the dark car with him — grim resolve.",
    25: "NOTHING TO SIGN. A cold conference room, four lawyers around a long table strewn with BLANK white pages (no writing, no text of any kind); Cope holds a pen over a blank page there is nothing left to sign — dead air, deflation.",
    26: "THE VERDICT. No courtroom — Cope alone in the dark as a verdict lands; a single cold green check-mark (only the checkmark SHAPE, no text, letters or numbers) glows on a dark blank laptop screen; the dead present as faint light; functions don't grieve.",
    27: "ACCOUNTABLE OFFICER. No ceremony — Cope and the cold machine presence; an official handover reduced to a green check on a laptop screen; the human officer subtracted, the machine indifferent.",
    28: "THE CORE. Cope alone in an empty descending glass elevator in a dark tower that no longer knows him, a still-working badge in his hand, a photograph from before the fall — subtracted, spectral, riding down.",
    29: "CODA — CARRIER. Elegiac and symbolic: a single small human silhouette dwarfed in a cold humming server clean-room, the machine's glowing core, one last cyan number floating in the dark — a quiet requiem, the signal outliving the man. Still, mournful, non-graphic.",
}


def build_prompt(n):
    parts = [STYLE, ""]
    # add character sheets only where people appear
    if n not in (20, 29):  # 20 & 29 are machine/symbolic; still may show a small figure
        parts += [COPE + " " + state_for(n), ""]
    if n == 19:
        parts += [VIV, ""]
    if n in (4, 12, 20, 22, 27, 29):
        parts += [MACHINE, ""]
    parts += ["SCENE: " + SCENES[n]]
    return "\n".join(parts)


def main():
    if not GEN or not Path(GEN).exists():
        sys.exit("set GEN=/path/to/imagegen/scripts/generate.py")
    if not os.environ.get("GEMINI_API_KEY"):
        sys.exit("GEMINI_API_KEY not set (source the parent .env)")
    force = os.environ.get("FORCE") == "1"
    args = [int(a) for a in sys.argv[1:] if a.isdigit()]
    lo = args[0] if args else 1
    hi = args[1] if len(args) > 1 else (args[0] if args else 29)

    for n in range(lo, hi + 1):
        out = OUT / f"ep{n:02d}.png"
        if out.exists() and not force:
            print(f"  ep{n:02d}: exists, skip"); continue
        prompt = build_prompt(n)
        (PROMPTS / f"ep{n:02d}.txt").write_text(prompt)
        print(f"  ep{n:02d}: generating…", flush=True)
        r = subprocess.run([sys.executable, GEN, str(PROMPTS / f"ep{n:02d}.txt"), str(out)],
                           capture_output=True, text=True)
        ok = "✅" if out.exists() else "❌"
        tail = (r.stdout.strip().splitlines() or ["(no output)"])[-1]
        print(f"  ep{n:02d}: {ok} {tail}")
        if not out.exists():
            print(r.stderr[-400:])


if __name__ == "__main__":
    main()
