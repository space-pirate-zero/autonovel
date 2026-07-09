#!/usr/bin/env python3
"""
compose_songs.py — regenerate the album tracks as world-class, era-forward
goth-industrial-lofi type beats.

Fixes the two problems with the old batch:
  1. STATIC INTRO — the old prose prompt let the model prepend a quiet
     vinyl-crackle/ambient lead-in (same on every track). We ban that with
     negative_global_styles + a downbeat "cold start" intro section.
  2. SAME / GENERIC — one flat prompt collapsed every track to the shared
     industrial-goth denominator. We use a composition_plan and weave the
     door's ERA instruments into EVERY section's local styles, so the decade
     leads instead of tinting.

Instrumental (force_instrumental) so the spoken-sample pockets still work.

Usage:
  set -a; . /Users/gregchambers/autonovel/.env; set +a
  uv run --with elevenlabs python3 tools/compose_songs.py 2 3 14      # specific doors
  uv run --with elevenlabs python3 tools/compose_songs.py all
"""
import os, sys, subprocess, pathlib, tempfile

HERE = pathlib.Path(__file__).resolve().parent
SONGS = HERE.parent / "audio" / "songs"
SONGS.mkdir(parents=True, exist_ok=True)
DOWNLOADS = pathlib.Path.home() / "Downloads"
REVIEW = pathlib.Path.home()/"Library"/"Mobile Documents"/"com~apple~CloudDocs"/"a+_neko"/"review"
REVIEW.mkdir(parents=True, exist_ok=True)

# The engine every track shares — the SPZ sound. Era leads; this is the spine.
ENGINE = [
    "lofi industrial goth", "darkwave trip-hop noir",
    "gritty tape-saturated drum machine", "enormous distorted 808 sub-bass",
    "cold detuned analog synths", "cyberpunk neon-reverb arpeggios",
]
# Professional finish — pushes the model off "demo" quality.
FINISH = [
    "cohesive professional studio mix", "mastered", "hi-fi", "wide stereo image",
    "punchy tight low end", "clear high-end air", "radio-ready",
]
# Kills the static intro + the generic wash.
NEG_GLOBAL = [
    "generic", "boring", "repetitive", "aimless", "muddy", "low quality",
    "amateur", "demo quality", "thin", "MIDI", "elevator music",
    "karaoke backing track",
    # intro-static killers:
    "long ambient intro", "slow fade-in", "silent intro", "empty intro",
    "vinyl-crackle intro", "white-noise wash", "tape-hiss intro", "static intro",
    "ambient pad build-up before the beat",
]

# door -> (slug, era_lead, [era instruments woven everywhere], bpm, mood, texture)
DOORS = {
 1:("never-supposed-to-be-here","2003 Atlanta EBM cyber-goth nightclub",
    ["pounding four-on-the-floor industrial kick","cold detuned EBM synth stabs","aggressive cyberpunk arpeggio lead","strobe-hum drone","fog-machine hiss"],70,"doomed hypnotic dancefloor","green-lit noir"),
 2:("indra","1967 San Francisco psychedelic acid-rock",
    ["fuzz-and-wah electric guitar","swirling Hammond organ","sitar drone","tambourine","bluesy soul-wail lead"],85,"cosmic hallucinatory","lava-lamp warmth"),
 3:("slow-enough-to-stay","2007 Houston chopped-and-screwed",
    ["chopped-and-screwed half-time syrup tempo","pitched-down screwed Southern-soul sample","Southern country-rap swing","Southern trap triplet hi-hats","codeine-slow groove"],60,"screwed-down hypnotic","purple syrup haze"),
 4:("weather-in-your-hands","1970 London acid-rock",
    ["wailing fuzz-and-wah Stratocaster","Marshall-stack overdrive","backwards-guitar swirls","psychedelic funk-rock drums","bluesy string bends"],70,"psychedelic doomed","turpentine-rain haze"),
 5:("edge-of-the-light","1962 Hollywood supper-club glamour",
    ["lush orchestral-pop strings","brushed jazz drums","upright bass","vibraphone","sultry vintage nightclub saxophone"],70,"cinematic doomed romance","platinum-and-shadow"),
 6:("a-name-outlives-the-man","1971 Paris psychedelic blues-rock",
    ["vintage combo organ","snake-charming bluesy lead guitar","brushed cafe-noir jazz drums","ghost of French accordion chanson","baritone croon phrasing"],70,"hypnotic doomed","grey Paris rain"),
 7:("dont-go-dark","late-1950s desolate noir-jazz",
    ["lone spare grand piano","soft brushed drums","upright bass","distant cool-jazz muted trumpet","vast empty room ache"],60,"glacial claustrophobic naked","one dead yellow lamp"),
 8:("forty-screens","2007 tabloid celebrity electro-pop",
    ["glossy mid-2000s electro-pop synths","autotune-sheen lead","news-ticker pulse","paparazzi flashbulb hits","glossy radio-R&B groove"],70,"cinematic doomed spectacle","forty-screens glare"),
 9:("hold-me-while-i-flicker","1994 Seattle grunge",
    ["drop-D big-fuzz guitars","pounding live rock drums","quiet-loud whisper-to-wall dynamics","howling guitar feedback","broken-signal glitch stutter"],70,"devastating quiet-loud doomed","flannel-and-rain"),
 10:("caught-in-a-trap","1977 Las Vegas showroom",
    ["big gospel-soul brass section","Hammond organ","slow rockabilly shuffle","orchestral supper-club grandeur gone to seed","buried slot-machine chime"],70,"grand doomed","jumpsuit-sweat neon"),
 11:("one-floor-up","2012 gospel-diva balladry",
    ["colossal soul-diva phrasing","Hammond church organ","full gospel choir swell","glossy R&B production","cinematic string sweeps and tambourine"],70,"devastating reverent","marble-and-lilies hush"),
 12:("count-the-doors","haunted Belfast Celtic-punk lament",
    ["mournful uilleann pipes","lament fiddle","bodhran heartbeat","ragged post-punk guitar","struck-match hiss"],70,"spectral devotional doomed","grey Belfast dawn rain"),
 13:("held-in-contempt","1966 West-Coast cool jazz",
    ["smoky comedy-club combo","brushed drums","upright walking bass","late-night noir saxophone","beatnik vibraphone"],70,"wry doomed","smoke and stenograph clatter"),
 14:("cash-from-chaos","1979 King's-Road punk",
    ["raw buzzsaw distorted guitars","snotty three-chord thrash","spitting snare","sneering shouted energy","till-drawer chime and camera-shutter"],70,"furious doomed secretly-romantic","blank-generation grime"),
 15:("the-mask-eats-the-man","2008 cinematic blockbuster dread",
    ["dark orchestral score","rising Shepard-tone strings","low brass swells","single sustained bowed-cello note of menace","hushed indie-NYC lone piano"],70,"vast doomed aching","green-room mirror-bulb buzz"),
 16:("one-jump-left","2011 Camden retro-soul",
    ["smoky girl-group soul backbeat","punchy vintage brass stabs","vintage electric piano","British neo-soul phrasing","beehive-and-eyeliner heartbreak"],70,"devastating peak romance","Camden rain"),
 17:("you-cant-rewind","late-2000s glossy dance-pop production",
    ["glossy funk-pop bass","gated gospel-pop drums","staccato string stabs","breathy pop-soul falsetto ghost","rehearsal-hall piano and rewinding-tape whir"],70,"glossy devastated","midnight ghost-light hall"),
 18:("buy-the-ticket","2005 gonzo desert-rock",
    ["outlaw-country-blues swagger","fuzzed desert-rock guitar","ragged barroom piano","loose whiskey-soaked drums","harmonica wail"],70,"unhinged doomed secretly-tender","Vegas-desert heat-shimmer"),
 19:("quality-control","cold sleek modern corporate menace",
    ["glacial minimal-techno pulse","boardroom-hum drone","sterile glass-and-steel synth","clinical clicks and rimshots","dread-frequency sub"],70,"glacial vast dread-and-devotion","Davos glass tower"),
 20:("nobody-gets-out","modern Gulf-futurism",
    ["grand Arabic-tinged EDM","mournful oud and ney flute","luxury-mall trap hi-hats","call-to-prayer melisma turned cold","glass-tower grandeur"],70,"vast doomed resolute","desert heat over glass"),
 21:("signal-and-its-merch","1993 scumrock hardcore-punk vs sterile influencer-pop",
    ["blown-out buzzsaw distortion past the red","screamed hardcore throat","blood-and-chaos basement filth","cutting to a sterile glossy edgy-influencer jingle","ring-light hum against basement hum"],70,"doomed then tender","basement blood to ring-light"),
 22:("last-solid-night","1993 LA indie-folk (warm, gentle)",
    ["soft fingerpicked acoustic guitar","brushed-snare shuffle","warm Rhodes","Sunset-Strip lounge-jazz saxophone","earnest boy-with-a-guitar sincerity"],70,"bittersweet luminous warm","warm diner-radio glow"),
 23:("the-only-way-is-through","the Cathedral of Wires — cosmic devastating",
    ["vast reverberant choir-of-signal drone","lone grieving piano","Seattle rain","the show's main-theme motif surfacing whole","a single held signal-tone rising to white"],70,"unbearable swelling grief","cathedral of wires"),
 24:("signal-finds-signal","triumphant dawn finale — every era-thread resolved warm",
    ["a ghost of psych fuzz","gospel Hammond organ","warm soul horns","fingerpicked acoustic","choir-of-signal and church-bell-bright synths","sunrise pads"],70,"triumphant tender radiant dawn","Belfast sunrise, armour off"),
}

import re
ALBUM = HERE.parent / "album.md"
VOCAL = ["intimate male goth-crooner lead answered by a breathy female voice",
         "call-and-response torch duet", "emotional devoted delivery",
         "clearly enunciated intelligible English lyrics", "crisp diction, words out front in the mix",
         "natural unhurried phrasing", "lead vocal loud and clear above the instrumental"]
NO_VOX = ["no vocals", "instrumental only", "leave a clean open pocket for spoken word"]

def parse_lyrics(n):
    """Pull the fenced lyric block for door n from album.md into
    [(section_name, is_instrumental, [clean lines])] preserving order."""
    txt = ALBUM.read_text()
    m = re.search(rf"^## TRACK {n} .*?```(.*?)```", txt, re.S | re.M)
    if not m:
        return []
    body = m.group(1)
    out, cur = [], None
    for raw in body.splitlines():
        line = raw.rstrip()
        h = re.match(r"^\[([^\]]*)\]\s*$", line)          # a section header, e.g. [Verse 1 - SPZ]
        if h:
            head = h.group(1)
            name = re.split(r"\s+-\s+", head)[0].strip().title()
            instrumental = ("instrumental" in head.lower()) or ("no vocals" in head.lower())
            cur = {"name": name, "inst": instrumental, "lines": []}
            out.append(cur)
        elif line and cur is not None:
            clean = re.sub(r"^\[(SPZ|Kat|Both)\]\s*", "", line).strip()   # drop role tags
            if clean:
                cur["lines"].append(clean)
    return out

def plan_for(n, vocal=True):
    from elevenlabs.types.music_prompt import MusicPrompt
    from elevenlabs.types.song_section import SongSection
    slug, era, instr, bpm, mood, texture = DOORS[n]
    era_lead = [era] + instr + [f"the {era} instruments sit up front, fused with (never buried under) the engine"]
    pos_global = era_lead + ENGINE + [f"~{bpm} BPM", mood, texture] + FINISH
    if vocal:
        pos_global = pos_global + VOCAL

    def S(name, secs, extra, lines=None, neg=None):
        return SongSection(section_name=name,
                           positive_local_styles=era_lead[:6] + extra,
                           negative_local_styles=(neg or []),
                           duration_ms=int(secs * 1000), lines=lines or [])

    sections = []
    intro_extra = ["cold start straight in on the downbeat",
                   "full beat and the lead era instrument from bar one",
                   "no fade-in, no ambient build", "808 and drums locked immediately"]
    intro_neg = ["fade-in", "ambient intro", "silence", "slow build"]

    parsed = parse_lyrics(n) if vocal else []
    if vocal and parsed:
        first = True
        for sec in parsed:
            if sec["inst"]:
                nm = sec["name"].lower()
                is_outro = "outro" in nm
                extra = (intro_extra if (first or "intro" in nm)
                         else ["drop to beat and 808 only, minimal", "one era instrument echoing"]) + NO_VOX
                # generous instrumental pockets = clean room for the spoken samples
                secs = 24 if is_outro else 17
                sections.append(S(sec["name"], secs, extra, lines=[], neg=intro_neg))
            else:
                # longer sung sections so the track runs full-length (~3.5 min)
                secs = max(14, min(34, len(sec["lines"]) * 4.4))
                sections.append(S(sec["name"], secs, VOCAL + ["lead melody carries the hook"], lines=sec["lines"]))
            first = False
        # guarantee a clean instrumental pocket at head and tail for samples
        if not sections[0].lines == [] or "intro" not in sections[0].section_name.lower():
            sections.insert(0, S("Intro", 17, intro_extra + NO_VOX, lines=[], neg=intro_neg))
        respect = True   # honor the durations so the track is full-length
    else:
        sections = [
            S("Intro", 14, intro_extra + ["instrumental"], lines=[], neg=intro_neg + ["vocals","singing"]),
            S("Groove A", 30, ["main groove, era instruments carrying the melody","leave a clean instrumental pocket"], lines=[], neg=["vocals","singing"]),
            S("Hook", 32, ["biggest hook — era and industrial-goth fully fused","cinematic and full"], lines=[], neg=["vocals","singing"]),
            S("Breakdown", 18, ["drop to beat and 808 only","a clean open pocket"], lines=[], neg=["vocals","singing"]),
            S("Groove B", 30, ["groove returns with variation"], lines=[], neg=["vocals","singing"]),
            S("Hook 2", 32, ["climactic full arrangement, peak energy"], lines=[], neg=["vocals","singing"]),
            S("Outro", 24, ["era motif rings out then resolves","tight controlled ending, not a long fade"], lines=[], neg=["vocals","singing"]),
        ]
        respect = True
    total = sum(s.duration_ms for s in sections)
    return MusicPrompt(positive_global_styles=pos_global, negative_global_styles=NEG_GLOBAL, sections=sections), total, slug, respect

def probe_dur(p):
    r = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                        "-of","csv=p=0",str(p)], capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except: return 0.0

def master(raw: pathlib.Path, out: pathlib.Path):
    """Strip any quiet head, loudness-normalize loud+clean, limit, tail fade sized to length."""
    dur = probe_dur(raw)
    fo_start = max(1.0, dur - 4.0)
    af = ("silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05:detection=peak,"
          "afade=t=in:st=0:d=0.04,"
          "loudnorm=I=-10:TP=-1.0:LRA=11,"
          f"afade=t=out:st={fo_start:.2f}:d=4,"
          "alimiter=limit=0.95")
    subprocess.run(["ffmpeg","-y","-v","error","-i",str(raw),"-af",af,
                    "-ar","44100","-b:a","192k",str(out)], check=True)

def generate(n, vocal=True):
    from elevenlabs.client import ElevenLabs
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: sys.exit("ELEVENLABS_API_KEY not set (source the parent .env)")
    c = ElevenLabs(api_key=key)
    plan, total, slug, respect = plan_for(n, vocal=vocal)
    tag = "VOX" if vocal else "PRO"
    print(f"[door {n:>2}] {slug} — {DOORS[n][1]} · ~{total//1000}s · {'sung duet' if vocal else 'instrumental'}")
    # API notes: no music_length_ms with composition_plan (length = section durations);
    # force_instrumental only pairs with `prompt` (instrumental = empty lines + no-vocals styles).
    def _compose(p):
        return c.music.compose(composition_plan=p, model_id="music_v1",
                               respect_sections_durations=respect,
                               output_format="mp3_44100_192")
    try:
        audio = _compose(plan)
        data = b"".join(audio)
    except Exception as ex:
        # On a ToS 'bad_composition_plan', the API hands back a compliant
        # composition_plan_suggestion — rebuild from it and retry once.
        sug = None
        body = getattr(ex, "body", None)
        if isinstance(body, dict):
            sug = body.get("detail", {}).get("data", {}).get("composition_plan_suggestion")
        if not sug:
            raise
        from elevenlabs.types.music_prompt import MusicPrompt
        from elevenlabs.types.song_section import SongSection
        plan2 = MusicPrompt(positive_global_styles=sug["positive_global_styles"],
                            negative_global_styles=sug["negative_global_styles"],
                            sections=[SongSection(**s) for s in sug["sections"]])
        print("          ToS flagged the plan; retrying with the API's compliant suggestion...")
        data = b"".join(_compose(plan2))
    raw = SONGS / f"track{n:02d}_{slug}_{tag}_RAW.mp3"
    raw.write_bytes(data)
    out = SONGS / f"track{n:02d}_{slug}_{tag}.mp3"
    master(raw, out)
    (DOWNLOADS / out.name).write_bytes(out.read_bytes())
    (REVIEW / out.name).write_bytes(out.read_bytes())
    print(f"          -> {out.name}  ({out.stat().st_size//1024} KB, {probe_dur(out):.0f}s)  + copied to ~/Downloads")
    return out

if __name__ == "__main__":
    args = sys.argv[1:]
    vocal = True
    if "--instrumental" in args:
        vocal = False; args.remove("--instrumental")
    if not args: sys.exit(__doc__)
    doors = list(DOORS) if args == ["all"] else [int(a) for a in args]
    for n in doors:
        generate(n, vocal=vocal)
