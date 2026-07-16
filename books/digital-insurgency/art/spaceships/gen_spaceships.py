#!/usr/bin/env python3
"""
gen_spaceships.py — generate the 15 "Spaceship Alpha 9" scene images for
Digital Insurgency (one per major moment). House style locked in STYLE below;
per-scene content in prompts.json. Backend: Google Gemini "Nano Banana" image model
(FAL_KEY is not provisioned; GEMINI_API_KEY is in GCP Secret Manager).

Needs GEMINI_API_KEY. Provision it (gcloud-authed to project `stylelift`):
  export GEMINI_API_KEY=$(gcloud secrets versions access latest \
      --secret=GEMINI_API_KEY --project=stylelift)

Usage (from books/digital-insurgency/):
  python3 art/spaceships/gen_spaceships.py            # all 15
  python3 art/spaceships/gen_spaceships.py --only 1   # just scene 1 (style test)
  python3 art/spaceships/gen_spaceships.py --from 6   # scenes 6..15
  python3 art/spaceships/gen_spaceships.py --list     # print scenes, don't generate
  python3 art/spaceships/gen_spaceships.py --model gemini-2.0-flash-preview-image-generation

Outputs art/spaceships/NN_slug.png. Re-running overwrites.
"""
import json, os, sys, base64, argparse, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).resolve().parent
BOOK = HERE.parent.parent                       # books/digital-insurgency/
GEMINI_MODELS = ["gemini-2.5-flash-image", "gemini-2.0-flash-preview-image-generation"]
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

# ── The locked "Spaceship Alpha 9" house style (matches the reference set) ──
STYLE = (
    "Cartoon vector illustration, cel-shaded, clean bold linework, retro-synthwave "
    "neon aesthetic, poster-like. Pure BLACK background. CENTERPIECE: the "
    "'SPACESHIP ALPHA 9' flying saucer — a classic UFO with a clear glass dome "
    "cockpit (two seats and a control panel dotted with small pink and cyan lights), "
    "a dark charcoal metallic saucer disc trimmed with hot-pink neon panel lines and "
    "a glowing electric-cyan underside rim, and a 'SPACESHIP ALPHA 9' neon nameplate "
    "in cyan letters with a pink glow across the disc's side; a slim antenna rises "
    "from the dome topped with a glowing magenta-pink orb. A translucent teal/cyan "
    "tractor beam projects downward from the saucer's underside. Strict palette: "
    "hot pink / magenta (#ff1493) and electric cyan (#00f0ff) neon on black, high "
    "contrast, subtle glow and bloom. Square 1:1, centered composition. No "
    "photorealism. The ONLY readable text is the neon elements described."
)


def load_key():
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if key:
        return key
    env = BOOK / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            line = line.strip()
            if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                v = line.split("=", 1)[1].strip().strip('"').strip("'")
                if v:
                    return v
    return None


def build_prompt(scene):
    # Assets can carry a self-contained 'prompt_full' (bypasses the saucer STYLE wrapper).
    if scene.get("prompt_full"):
        return scene["prompt_full"]
    return (
        f"{STYLE}\n\nSCENE ({scene['label']}): {scene['scene']} "
        f"Include a clean neon label reading '{scene['label']}' in the composition."
    )


def gemini_generate(prompt, key, model, dest):
    """Call Gemini image model; write the first inline image part to dest. Returns True."""
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode()
    req = urllib.request.Request(
        GEMINI_URL.format(model=model, key=key), data=payload,
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read().decode())
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob and blob.get("data"):
                dest.write_bytes(base64.b64decode(blob["data"]))
                return True
    raise RuntimeError("no image part in response: " + json.dumps(data)[:300])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int, help="generate a single scene number")
    ap.add_argument("--from", dest="start", type=int, default=1, help="start scene number")
    ap.add_argument("--model", default=None, help="override Gemini image model")
    ap.add_argument("--prompts", default=None, help="prompts JSON (default prompts.json)")
    ap.add_argument("--outdir", default=None, help="output dir (default: alongside the prompts file)")
    ap.add_argument("--list", action="store_true", help="list scenes and exit")
    args = ap.parse_args()

    prompts_path = Path(args.prompts) if args.prompts else (HERE / "prompts.json")
    if not prompts_path.is_absolute():
        prompts_path = (BOOK / prompts_path) if (BOOK / prompts_path).exists() else prompts_path
    scenes = json.loads(prompts_path.read_text())["scenes"]
    outdir = Path(args.outdir) if args.outdir else prompts_path.parent
    if not outdir.is_absolute():
        outdir = BOOK / outdir

    if args.list:
        for s in scenes:
            print(f"  {s['n']:2d}. {s['label']:<28} — {s['book']}")
        return

    if args.only:
        scenes = [s for s in scenes if s["n"] == args.only]
    else:
        scenes = [s for s in scenes if s["n"] >= args.start]

    key = load_key()
    if not key:
        print("GEMINI_API_KEY missing. Provision it:\n"
              "  export GEMINI_API_KEY=$(gcloud secrets versions access latest "
              "--secret=GEMINI_API_KEY --project=stylelift)\nAborting.")
        sys.exit(1)

    models = [args.model] if args.model else GEMINI_MODELS
    outdir.mkdir(parents=True, exist_ok=True)
    ok = 0
    for s in scenes:
        dest = outdir / f"{s['n']:02d}_{s['slug']}.png"
        print(f"[{s['n']:2d}] {s['label']} …", flush=True)
        last = None
        for model in models:
            try:
                gemini_generate(build_prompt(s), key, model, dest)
                print(f"        → {dest.relative_to(BOOK)}  ({model})")
                ok += 1
                last = None
                break
            except urllib.error.HTTPError as e:
                last = f"HTTP {e.code} ({model}): {e.read().decode()[:160]}"
            except Exception as e:
                last = f"{type(e).__name__} ({model}): {e}"
        if last:
            print(f"        !! {last}")
    try:
        where = outdir.relative_to(BOOK)
    except ValueError:
        where = outdir
    print(f"\ndone: {ok}/{len(scenes)} generated in {where}/")


if __name__ == "__main__":
    main()
