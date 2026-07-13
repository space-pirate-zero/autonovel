#!/usr/bin/env python3
"""
gen_theme.py — author the theme music + professional title-card intro for
*The Last Human CEO*, in the SPZ sound (same engine that made "Signal Finds
Signal" and the Neko Death Cult album).

Two deliverables:
  audiobook/theme.mp3     — an original ~2.5 min instrumental theme (ElevenLabs
                            Music API composition_plan, mastered).
  audiobook/00_intro.mp3  — the pro intro: SPZ's voice reading the book's built-in
                            Twilight-Zone title card, sidechain-ducked over the
                            theme bed, mastered to audiobook loudness.

Bespoke palette for THIS book: Southern-gothic corporate-dynasty decay (dusty
supper-club strings, faded gospel-soul brass, a lone grand piano in a marble
lobby) colliding with cold machine menace (boardroom-hum drone, sterile
glass-and-steel synth, dread sub) over the SPZ industrial-goth spine. ~68 BPM.

Usage (from the book dir):
  uv run --with elevenlabs --with python-dotenv python gen_theme.py            # theme + intro
  uv run --with elevenlabs --with python-dotenv python gen_theme.py --theme    # theme only
  uv run --with elevenlabs --with python-dotenv python gen_theme.py --intro    # intro only (needs theme.mp3)
"""
import os, sys, json, subprocess, tempfile
from pathlib import Path
from dotenv import load_dotenv

BASE = Path(__file__).parent
load_dotenv(BASE / ".env", override=True)
AUDIO = BASE / "audiobook"; AUDIO.mkdir(exist_ok=True)
VOICES = json.loads((BASE / "audiobook_voices.json").read_text())

THEME_RAW = AUDIO / "theme_RAW.mp3"
THEME = AUDIO / "theme.mp3"
VO = AUDIO / "intro_vo.mp3"
INTRO = AUDIO / "00_intro.mp3"

# ---- SPZ sonic engine (from brand/spz + neko compose_songs.py) ----
ENGINE = [
    "lofi industrial goth", "darkwave trip-hop noir",
    "gritty tape-saturated drum machine", "enormous distorted 808 sub-bass",
    "cold detuned analog synths", "cyberpunk neon-reverb arpeggios",
]
FINISH = [
    "cohesive professional studio mix", "mastered", "hi-fi", "wide stereo image",
    "punchy tight low end", "clear high-end air", "radio-ready", "cinematic",
]
NEG_GLOBAL = [
    "generic", "boring", "repetitive", "aimless", "muddy", "low quality",
    "amateur", "demo quality", "thin", "MIDI", "elevator music",
    "karaoke backing track", "vinyl-crackle intro", "white-noise wash",
    "tape-hiss intro", "static intro", "vocals", "singing", "spoken word",
]

# ---- bespoke palette for The Last Human CEO ----
LEAD = [
    "Southern-gothic corporate-dynasty noir",
    "decayed old-money grandeur: dusty orchestral supper-club strings and faded gospel-soul brass gone to seed",
    "a lone struck grand piano ringing in an empty marble lobby",
    "glacial modern corporate menace: boardroom-hum drone, sterile glass-and-steel synth, clinical clicks and rimshots, dread-frequency sub",
    "human warmth and machine cold fused into one theme",
]
MOOD = "vast, doomed, dread-and-grandeur"
TEXTURE = "a limestone tower at midnight with one light left on"
BPM = 68


def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except: return 0.0


def master_music(raw, out, I=-11):
    dur = probe(raw)
    fo = max(1.0, dur - 4.0)
    af = ("silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05:detection=peak,"
          "afade=t=in:st=0:d=0.04,"
          f"loudnorm=I={I}:TP=-1.0:LRA=11,"
          f"afade=t=out:st={fo:.2f}:d=4,"
          "alimiter=limit=0.95")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", af,
                    "-ar", "44100", "-b:a", "192k", str(out)], check=True)


def compose_theme():
    from elevenlabs.client import ElevenLabs
    from elevenlabs.types.music_prompt import MusicPrompt
    from elevenlabs.types.song_section import SongSection
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: sys.exit("ELEVENLABS_API_KEY not set")
    c = ElevenLabs(api_key=key)

    pos_global = LEAD + ENGINE + [f"~{BPM} BPM", MOOD, TEXTURE] + FINISH
    NO_VOX = ["no vocals", "instrumental only"]
    cold = ["cold deliberate downbeat, no fade-in, no ambient build"]

    def S(name, secs, extra, neg=None):
        return SongSection(section_name=name,
                           positive_local_styles=LEAD[:4] + extra + NO_VOX,
                           negative_local_styles=(neg or []) + ["vocals", "singing"],
                           duration_ms=int(secs * 1000), lines=[])

    sections = [
        S("Title Bed", 46,
          cold + ["sparse and patient", "boardroom-hum drone under a single struck grand-piano note",
                  "distant decayed brass, a machine pulse felt more than heard",
                  "leave a wide clean open pocket for a spoken title-card voiceover"],
          neg=["fade-in", "ambient wash", "silence", "busy", "dense"]),
        S("Rise", 24,
          ["the machine pulse tightens", "sterile glass-and-steel synth enters",
           "old-money strings swell then sour", "dread sub creeps up"]),
        S("Theme", 42,
          ["the full theme states itself", "decayed dynastic grandeur collides head-on with cold corporate minimal-techno menace",
           "industrial-goth spine locked, vast and cinematic", "biggest moment"]),
        S("Breakdown", 18,
          ["drop to boardroom-hum drone, lone piano and dread sub", "a clean open pocket", "naked and cold"]),
        S("Reprise", 30,
          ["theme motif returns and resolves cold", "a light left on overnight",
           "tight controlled ending, not a long fade"]),
    ]
    plan = MusicPrompt(positive_global_styles=pos_global,
                       negative_global_styles=NEG_GLOBAL, sections=sections)

    def _compose(p):
        return c.music.compose(composition_plan=p, model_id="music_v1",
                               respect_sections_durations=True,
                               output_format="mp3_44100_192")
    total = sum(s.duration_ms for s in sections) // 1000
    print(f"Composing theme — ~{total}s, {BPM} BPM, {MOOD} ...")
    try:
        data = b"".join(_compose(plan))
    except Exception as ex:
        body = getattr(ex, "body", None)
        sug = (body or {}).get("detail", {}).get("data", {}).get("composition_plan_suggestion") if isinstance(body, dict) else None
        if not sug: raise
        print("  ToS flagged the plan; retrying with the API's compliant suggestion...")
        plan2 = MusicPrompt(positive_global_styles=sug["positive_global_styles"],
                            negative_global_styles=sug["negative_global_styles"],
                            sections=[SongSection(**s) for s in sug["sections"]])
        data = b"".join(_compose(plan2))
    THEME_RAW.write_bytes(data)
    master_music(THEME_RAW, THEME, I=-11)
    print(f"  -> {THEME.name}  ({THEME.stat().st_size//1024} KB, {probe(THEME):.0f}s)")


# ---- intro voiceover ----
INTRO_VO_TEXT = (
    "[dry, low, unhurried] There is a dimension beyond the org chart. "
    "A dimension as cheap as compute and as old as greed, lying between the quarterly guidance and the obituary. "
    "It is the place where a man discovers that everything he was paid twenty-nine million dollars a year to be — "
    "the vision, the nerve, the soul in the chair — can be done better by something that has never once needed to be loved. "
    "He is about to take that trip. [beat] He thinks it's a victory lap. "
    "[slow] Submitted for your consideration: [pause] the last human C E O."
)


def render_vo():
    from elevenlabs.client import ElevenLabs
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: sys.exit("ELEVENLABS_API_KEY not set")
    c = ElevenLabs(api_key=key)
    spz = VOICES["NARRATOR"]
    print("Rendering SPZ intro voiceover ...")
    audio = c.text_to_speech.convert(voice_id=spz["voice_id"], model_id=spz["model_id"],
                                     text=INTRO_VO_TEXT, voice_settings=spz["voice_settings"])
    VO.write_bytes(b"".join(x for x in audio))
    print(f"  -> {VO.name}  ({probe(VO):.1f}s)")


def build_intro(lead_in=2.6, tail=6.0):
    """SPZ VO ducked over the theme head, mastered to audiobook loudness (~-16 LUFS)."""
    if not THEME.exists(): sys.exit("theme.mp3 missing — run without --intro first (or --theme)")
    if not VO.exists(): render_vo()
    vo_len = probe(VO)
    bed_len = lead_in + vo_len + tail
    tmp = Path(tempfile.mkdtemp(prefix="tlhc_intro_"))
    bed = tmp / "bed.mp3"
    # take the theme's opening as the bed
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(THEME), "-t", f"{bed_len:.2f}",
                    "-c:a", "libmp3lame", "-b:a", "192k", str(bed)], check=True)
    # VO delayed by lead_in; cleaned; used as sidechain trigger to duck the bed
    delay_ms = int(lead_in * 1000)
    fc = (
        f"[1:a]adelay={delay_ms}|{delay_ms},highpass=f=95,"
        "acompressor=threshold=-20dB:ratio=3:attack=6:release=140,volume=1.9[vo];"
        "[vo]asplit=2[vo_mix][vo_sc];"
        "[0:a][vo_sc]sidechaincompress=threshold=0.035:ratio=14:attack=6:release=340:makeup=1[duck];"
        f"[duck]afade=t=out:st={bed_len - tail + 1.2:.2f}:d={tail - 1.2:.2f}[bed_d];"
        "[bed_d][vo_mix]amix=inputs=2:duration=first:normalize=0,"
        "loudnorm=I=-16:TP=-1.5:LRA=11,alimiter=limit=0.97[out]"
    )
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(bed), "-i", str(VO),
                    "-filter_complex", fc, "-map", "[out]",
                    "-ar", "44100", "-b:a", "192k", str(INTRO)], check=True)
    print(f"  -> {INTRO.name}  ({probe(INTRO):.1f}s)  [SPZ VO ducked over theme, -16 LUFS]")


def main():
    args = sys.argv[1:]
    do_theme = "--intro" not in args
    do_intro = "--theme" not in args
    if do_theme:
        compose_theme()
    if do_intro:
        build_intro()
    print("\nDone.")
    for p in (THEME, INTRO):
        if p.exists():
            print(f"  {p}  ({probe(p):.0f}s)")


if __name__ == "__main__":
    main()
