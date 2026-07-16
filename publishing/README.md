# SA9 Publishing Pipeline

One local pipeline to publish the SA9 books/podcasts and see how they're doing.

## The one thing to understand

**Apple Podcasts and Spotify are directories, not hosts.** You never upload to
them. They subscribe to an **RSS feed** you host. You submit that feed's URL to
each directory **once**; every episode you then add to the feed appears
automatically on Apple, Spotify, Overcast, Pocket Casts, YouTube Music, etc.

So "publish" = **push audio to Google Cloud Storage + rebuild one `feed.xml`**.
That's what this pipeline does. Everything else fans out from the feed.

```
books/<book>/audio/produced/*.mp3
      → publish → gs://sa9-podcasts/<book>/{audio,cover.jpg,feed.xml}  (public)
      → submit feed URL ONCE → Apple / Spotify / Overcast / YouTube Music …
```

## Status

| Phase | What | State |
|------|------|-------|
| 1 | Core publish (GCS + RSS feed) | ✅ built + verified |
| 2 | Substack publish (unofficial API) | ✅ built (needs creds to run) |
| 3 | Analytics store (Apple Connect + Substack → SQLite) | ✅ built (needs creds to fill) |
| 4 | Local dashboard | ✅ built + verified |
| 5 | Self-hosted download counting (optional) | ⬜ |

## Run it

```bash
uv sync --extra publishing-extras                                  # analytics + dashboard deps
uv run python publishing/cli.py publish neko-death-cult --dry-run  # build feed offline
uv run python publishing/dashboard/app.py                          # dashboard → http://localhost:8777
```

Register the three MCP servers (then drive from Claude Code):

```bash
claude mcp add sa9-publish   -- uv run python publishing/servers/publish_server.py
claude mcp add sa9-substack  -- uv run python publishing/servers/substack_server.py
claude mcp add sa9-analytics -- uv run python publishing/servers/analytics_server.py
```

## Credentials (repo-root .env)

```ini
# Substack (Phase 2/3) — cookies OR email+password:
SUBSTACK_COOKIES_PATH=/abs/path/substack_cookies.json
SUBSTACK_EMAIL=you@example.com
SUBSTACK_PASSWORD=...
SUBSTACK_PUBLICATION_URL=https://yourpub.substack.com   # or set substack_url in config.yaml

# Apple Podcasts Connect analytics (Phase 3):
APPLE_PODCASTS_KEY_ID=XXXXXXXXXX
APPLE_PODCASTS_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APPLE_PODCASTS_P8_PATH=/abs/path/AuthKey_XXXXXXXXXX.p8
```

Google Cloud auth uses `gcloud auth application-default login` — no key in .env.

## Phase 0 — one-time setup (do this once)

Everything except the two directory submissions can be scripted; those two are
manual because Apple and Spotify require a human + login.

### 1. Google Cloud (project `stylelift`)

```bash
# Auth the library (uses Application Default Credentials)
gcloud auth application-default login
gcloud config set project stylelift

# Create the bucket (us-central1, uniform access)
gcloud storage buckets create gs://sa9-podcasts \
  --project=stylelift --location=us-central1 --uniform-bucket-level-access

# Make objects publicly readable (podcast apps fetch anonymously)
gcloud storage buckets add-iam-policy-binding gs://sa9-podcasts \
  --member=allUsers --role=roles/storage.objectViewer
```

> Optional but nicer: put the bucket behind a custom domain
> (`podcasts.spacepiratezero.com`) via a load balancer + Cloud CDN, then set
> `defaults.gcs.public_base` in `config.yaml` to that domain. Apple only needs a
> stable HTTPS feed URL — the `storage.googleapis.com` URL works fine to start.

### 2. Cover art

Apple requires **3000×3000** JPG/PNG. Put it at the `cover_art` path in
`config.yaml` (`books/neko-death-cult/audio/assets/cover.jpg`) and upload it:

```bash
uv run python publishing/cli.py cover neko-death-cult
```

### 3. Publish the show

```bash
# Offline dry-run first (writes publishing/.state/<show>.feed.xml, no GCS):
uv run python publishing/cli.py publish neko-death-cult --dry-run

# For real (uploads audio + feed to GCS):
uv run python publishing/cli.py publish neko-death-cult
```

Your feed is now live at:
`https://storage.googleapis.com/sa9-podcasts/neko-death-cult/feed.xml`

Validate it before submitting anywhere: paste that URL into
<https://podba.se/validate/> or <https://castfeedvalidator.com/>.

### 4. Submit the feed to the directories (MANUAL, one-time)

- **Apple Podcasts:** <https://podcastsconnect.apple.com> → "+" → add the feed
  URL → validate → submit. Approval takes hours-to-days.
- **Spotify:** <https://creators.spotify.com> → Add your podcast → paste the feed
  URL → verify via the code Spotify emails to `owner_email` → submit.
- Overcast / Pocket Casts / Podcast Index / YouTube Music: submit the same feed
  URL in each (or they auto-discover once you're in Apple's directory).

### 5. (Phase 3) Apple analytics key

For download/follower stats later: Podcasts Connect → Users and Access → keys →
generate an API key (ES256). Save the `.p8`, key id, and issuer id in `.env`.

## Everyday use

Once a new episode's `epNN_FINAL.mp3` exists and its title is in `config.yaml`:

```bash
uv run python publishing/cli.py add neko-death-cult 9      # publish episode 9
uv run python publishing/cli.py episodes neko-death-cult   # what's live
```

Or from Claude Code via the MCP server (see below): `add_episode`, `publish_book`,
`rebuild_feed`, `list_episodes`, `publish_cover`.

## MCP registration

```bash
claude mcp add sa9-publish -- uv run python publishing/servers/publish_server.py
```

(or copy `publishing/mcp.json` into your `.mcp.json`). Servers for Substack and
analytics get added in Phases 2–3.

## How it fits together

| File | Role |
|------|------|
| `config.yaml` | per-show metadata + episode titles + GCS/schedule |
| `core/config.py` | loads config, resolves URLs + paths |
| `core/manifest.py` | source-of-truth manifest (guid, pubdate, size, duration) |
| `core/feed.py` | builds the iTunes/podcast RSS |
| `core/gcs.py` | uploads audio / cover / feed to GCS |
| `core/publisher.py` | the actual publish operations (`--dry-run` aware) |
| `cli.py` | run any operation from the terminal |
| `servers/publish_server.py` | the same operations as MCP tools |

## Notes / trade-offs

- **Download counts:** self-hosting means *you* own IAB-style download counting.
  Until Phase 5 (a Cloud Run redirect that logs each fetch) exists, the reliable
  numbers come from Apple's and Spotify's own per-platform dashboards/APIs
  (Phase 3) — not from GCS.
- **Substack has no official API.** Phase 2 uses the unofficial `python-substack`;
  if Substack changes their site it may break, at which point Substack degrades to
  draft-only. The podcast pipeline is unaffected.
