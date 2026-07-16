# SPZ Site Kit — Shared Copy & Tokens

Use on every book site. Source of truth for design values: `brand/spz/`.

---

## The lockup

**Wordmark:** SPACE PIRATE ZERO (Orbitron 900, all-caps, pink on void)
**Tagline / sign-off:** *Signal finds signal.*
**Imprint:** Spaceship Alpha 9

Use "Signal finds signal." as the footer sign-off on every page. It is the
brand's amen — never explain it, never decorate it.

---

## Author bio

### One-liner (bylines, cards, OG)
> Burned-out DJ turned digital insurgent — narrates the counterfeit world at a bar at midnight, sneers up at the machine, never down at the broke.

### Short (about blocks, ~60 words)
> Space Pirate Zero writes from the salvage decks of Spaceship Alpha 9 —
> Atlanta in the bones, an Irish grandmother in the blood, a terminal for
> an altar. He makes books, an audio drama, and an album about the same
> war: the real thing versus the beige. He punches up. He never punches
> down. Signal finds signal.

### Long (about page)
> Space Pirate Zero is the author-persona and pirate station behind
> *Digital Insurgency*, *The Last Human CEO*, and *The Maneki Neko Death
> Cult*. The voice is a bar at midnight: raw, punk, nihilist-cool, a touch
> of Belfast in the cadence. The politics are older than the tech —
> Diogenes had it first: **deface the currency.** Expose the counterfeit.
> Live honest. Every broadcast aims the sneer at the system, the machine,
> and the fail-up rich — never at workers, never at the broke, never at
> you. Transmitting from Spaceship Alpha 9. Signal finds signal.

---

## Design tokens (all sites)

**Palette** (`brand/spz/palette.json`):

| Token | Hex | Role |
|---|---|---|
| void | `#030303` | background — never pure `#000000` |
| pink | `#FF1493` | primary accent, titles, CTAs |
| cyan | `#00F0FF` | links, terminal/code, signal accents |
| paper | `#E8E8E8` | body text on void |
| muted | `#8A90A0` | metadata, dividers, secondary text |

Rules: two neons, one void — never pink on cyan or cyan on pink; separate
with void or paper. Newsprint/VHS grit texture over the void is on-brand.
For light/print contexts invert: void text on paper.

**Type** (`brand/spz/typography.json`, all on Google Fonts):

- **Orbitron** 900/700 — display, all-caps, oversized ("airport-shelf readable")
- **Space Grotesk** 400/500/700 — body and UI
- **JetBrains Mono** 400/700 — code, timestamps, track IDs (set in cyan)
- **EB Garamond** — optional literary register (used on *The Last Human CEO*)

**Sound** (if the site plays anything): industrial-goth, ~70 BPM, deep
distorted 808, one beckoning-cat bell. See `brand/spz/sonic.json`.

---

## Navigation & footer copy

**Nav labels:** `The Books` · `The Show` · `The Album` · `The Broadcast` (Substack) · `Who Is SPZ`

**Footer:**
> Transmitting from Spaceship Alpha 9 · Atlanta, Earth
> No trackers. No pop-ups. No beige.
> *Signal finds signal.*

**Newsletter CTA (Substack embed):**
> **Tune the dial.** One broadcast at a time, free, no spam, unsubscribe
> whenever — I'd do the same.
> Button: `PICK UP THE SIGNAL`

---

## Master link table

| What | URL | Status |
|---|---|---|
| Substack (The Broadcast) | https://spacepiratezero.substack.com | LIVE |
| DI series opener (Day 1) | https://spacepiratezero.substack.com/p/day-130-the-rewrite | LIVE |
| Contact | zero@spacepiratezero.com | LIVE |
| Home domain | https://spacepiratezero.com | owned, unbuilt |
| Podcast RSS | https://storage.googleapis.com/sa9-podcasts/feed.xml | PENDING (publishing/ Phase 0) |
| Apple Podcasts / Spotify | — | PENDING (submit feed once hosted) |
| Amazon (per book) | — | PENDING (paste ASIN links post-publish) |

---

## Voice guardrails for anyone editing site copy

- Someone talking at a bar at midnight. If it reads like a press release, it failed.
- Active voice only. Punch up, never down.
- Banned on sight: leverage · synergy · ecosystem · paradigm · seamless ·
  robust · utilize · delve · game-changer · empower · best-in-class ·
  holistic · disruptive · scalable · streamline · innovative · transform.
