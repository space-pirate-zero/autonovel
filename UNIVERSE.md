# Spaceship Alpha 9 — The Shared Reality

Every story in this repo is one transmission from a single continuity. The books,
the album, and the audio dramas are not separate franchises — they are **signals
picked up from the same universe**, broadcast by the same pirate, on the same
frequency. This is the canon bible for that shared reality. Read it before writing,
scoring, illustrating, or marketing any title, and register every new work here.

> **Tagline / frequency:** *Signal finds signal.*

---

## 1. The frame

**Spaceship Alpha 9** is two things at once, and that's the point:

- **Out here (real):** the storytelling studio — *the premier AI-based storytelling
  studio in the South*, Atlanta, GA. Founders: **Greg Chambers** (*Space Pirate
  Zero* — architects the intelligence) and **Daniela Chambers** (engineers the
  empathy). "Storytelling isn't a support role. It's the mission." (`brand/spz/storytelling.json`)
- **In here (fiction):** the vessel / salvage-deck / pirate station at the ragged
  edge of things, from which **Space Pirate Zero** transmits these stories to you.
  "Transmitted to you from the salvage decks."

That doubling is canonical, not a marketing accident. The studio *is* the ship.
The founder *is* the pirate. Every release is *"a Space Pirate Zero transmission."*

### 1a. The vessel (canonical — the ONLY spaceship)

There is exactly **one** Spaceship Alpha 9, and it looks exactly one way, in
every property, product graphic, cover, social still, and animation:

- A classic **flying saucer**: wide dark gunmetal hull etched with a glowing
  **neon-pink circuit grid**.
- A large **glass dome cockpit** — empty twin seats and console visible inside
  (the pirate transmits; you never see him fly it).
- The glowing pink nameplate **"SPACESHIP ALPHA 9"** across the hull band.
- A **red-tipped antenna beacon** on top of the dome.
- Cyan rim-light accents; and when the ship interacts with the world below, a
  **mint-teal tractor beam** cone projecting downward onto the subject
  (a book, a product, a character, a city).
- Cel-shaded sticker/comic style on void-black, brand palette only.

**No alternate ship designs, ever** — no wireframe ships, no cruisers, no
fighters, no redesigns per property. Products (StyleLift, GhostDeck, DARKWAVE,
TradeCraft, OSMIX…) and books vary the *scene under the beam*, never the ship.
Reference renders live in the asset-mcp catalog under property `brand-spz`;
when generating, condition on them (`reference_asset_ids`). Enforcement:
`RULES.md` §3.5 + `brand/spz/ENFORCEMENT.md`.

## 2. Space Pirate Zero (SPZ) — the through-line

SPZ is the one constant across the whole reality. His role shifts by work:

- **Narrator / author-persona** — he transmits and frames the story but is not a
  character inside it (e.g. *The Last Human CEO*: SPZ appears only in the Voice
  Closers, not in the story world).
- **Protagonist / character** — he's *in* the story (e.g. *The Maneki Neko Death
  Cult*: SPZ is the time-slipper who burns himself down to jump).

Either way the **voice is the same**: raw, punk, confessional, nihilist-with-a-
heart — *Diogenes with a laptop, defacing the counterfeit to live honest*. Bar at
midnight. That consistency is what makes separate stories feel like one universe.
The audiobook host-intros, the site, and the socials are all SPZ speaking in that
voice — the frame leaking into the real world.

## 3. The transmissions (canon ledger)

Each title is a "transmission." Keep this table current — it is the index of the
shared reality.

| Transmission | Form | Logline | SPZ's role | Connective tissue |
|---|---|---|---|---|
| **The Last Human CEO** | Novel → full-cast audiobook (29 ch, ~12.6h) | In 2027, as boards swap CEOs for cheaper, scandal-proof AI, the last human chief executive wages a doomed crusade to prove a person still belongs in the chair — until the machine uncovers what he buried. | Narrator (Voice Closers) | The **machine that does its honest job** vs. the human who confused a throne for a soul. The counterfeit-vs-honest axis, stated plainly. |
| **The Maneki Neko Death Cult** | Scored audio drama (24 doors, ~10.5h) | 24 doors of an Advent Calendar of Death — each a dead-artist "saint," each a jump to another era/city, each a Twilight-Zone fable. A fail-up mark, a sting that lands back on SPZ. | Protagonist (the slipper) | **SPZ himself**, **Kat**, the **Cult**, and **"beige."** Time-slip mechanics; the cost of travel is self-destruction. |
| **Digital Insurgency** | Book — business × cyberpunk × spec-ops field manual | The counterfeit world, mapped as a field manual for the ones fighting it. | Voice / operator | Doctrine of the insurgency against counterfeit power; shares SPZ's ethos as method. |
| **Zero Trust Reality** | Book (nonfiction) | Original SA9 concept — trust nothing the counterfeit tells you; verify reality. | Author-persona | The nonfiction spine under the fiction: *deface the counterfeit, live honest.* |
| **Signal Finds Signal** | Album (24 tracks) | The sonic universe; secretly a love letter. | Composer / voice | The **sound** of Alpha 9 — the theme-world every audiobook's score lives inside. |

*(Loglines are held authoritatively in each book's own `SUMMARY.md`/`outline.md`;
this table is the cross-reference, not the source.)*

## 4. Shared law (the connective tissue)

These are the throughlines that make it one reality. Honor them; don't contradict
them. (Where a link is a **framing decision** rather than something already on the
page, it's marked — adjust freely, but adjust *here* so it stays canon.)

- **The counterfeit vs. the honest.** The universe's central axis. Counterfeit
  power — the throne, the brand, the scandal-managed image, the machine wearing a
  face — against the honest signal underneath. SPZ is always on the side of the
  honest, even when it costs him. Every transmission is a variation on this.
- **Signal finds signal.** Truth transmits; the right people receive it. The motif
  recurs as literal signal/noise, broadcasts, feeds, frequencies.
- **The machine is not the villain — dishonesty is.** In *TLHC* the machine wins by
  being *honest*. Machines in this reality are mirrors, not monsters. Keep AI
  uncanny and truthful, not evil.
- **Recurring artifacts & words** *(framing)*: **"beige"** (from *Neko Death Cult*)
  as the universe's word for counterfeit comfort/erasure; the salvage decks; the
  frequency. A new work may carry one of these across as a wink — an object, a
  phrase, a bar, a cocktail — but must not rewrite what it meant where it began.
- **Cameos travel, plots don't** *(framing)*: characters may glance across works
  (a name on a feed, a voice on a broadcast, SPZ transmitting), but each
  transmission stays **self-contained** — a new listener needs no prior title.
  Continuity rewards the faithful; it never gates the newcomer.

## 5. Adding a new transmission

When a new book/album/drama enters the repo:

1. **Register it** in the ledger (§3): form, logline, SPZ's role, connective tissue.
2. **Define the connection point** — how does *this* story sit in the reality? Which
   shared law does it dramatize? Does SPZ narrate it or live in it? Does it carry an
   artifact/word across (§4)? Write that down here before drafting locks.
3. **Keep SPZ's voice identical** across its host-intros, site, and socials — the
   voice is the universe's connective tissue (§2). Pull from `brand/spz/`.
4. **Don't contradict canon.** If the new story needs to bend an established fact,
   change it *here* first so the ledger stays true, then propagate.
5. **Produce it to standard.** Run it through the four pipelines in
   [`standards/`](standards/README.md) so it looks, sounds, and ships like the rest
   of the reality — same brand, same frame, same "Space Pirate Zero transmission."

---

*This file is the single source of truth for the shared reality. The studio side of
Alpha 9 lives in `brand/spz/storytelling.json`; the brand system in
[`standards/BRAND.md`](standards/BRAND.md); each story's internal canon in its own
`books/<book>/canon.md` / `world.md` / `characters.md`.*
