# web/ — Website Copy Decks

Everything needed to build a proper site for each book. One deck per book,
plus the shared SPZ site kit. All copy is written in the SPZ voice
(see `brand/spz/verbal.md`) and pulls verbatim from the production KDP
metadata, pitch docs, and manuscripts — nothing invented.

## Contents

| File | What it holds |
|---|---|
| [site-shared.md](site-shared.md) | Author bio, brand lockup, design tokens, nav/footer copy, master link table |
| [digital-insurgency.md](digital-insurgency.md) | Copy deck — *Digital Insurgency* (field manual) |
| [the-last-human-ceo.md](the-last-human-ceo.md) | Copy deck — *The Last Human CEO* (novel) |
| [maneki-neko-death-cult.md](maneki-neko-death-cult.md) | Copy deck — *The Maneki Neko Death Cult* (podcast + album) |

## Catalog note (read this)

There are **three** books with shippable content, not four.
`books/zero-trust-reality/` is a duplicate of *The Last Human CEO* — the
`autonovel/zero-trust-reality` branch was used for LHCEO KDP work and the
planned non-fiction *Zero Trust Reality* book (`book/` doc spine) was never
committed anywhere in git history. If a Zero Trust Reality site is wanted,
it can only be a "coming soon" page until the book exists.

## Link status

| Link | Status |
|---|---|
| https://spacepiratezero.substack.com | **LIVE** (Digital Insurgency 30-day fable run published) |
| spacepiratezero.com | Domain owned (it's the mail domain) — no site yet; suggested paths below |
| Podcast RSS `https://storage.googleapis.com/sa9-podcasts/feed.xml` | **PENDING** — Phase 0 of publishing/ pipeline (create `gs://sa9-podcasts`, submit to Apple/Spotify) |
| Amazon/KDP buy links | **PENDING** — insert ASIN URLs after publication |

Suggested site map on spacepiratezero.com:
`/` (SPZ hub) · `/insurgency` · `/ceo` · `/neko` · `/signal` (album)
