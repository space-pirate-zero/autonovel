# Branch & Worktree Ledger

`master` is the monorepo of record. Long-running work happens on `spz/*`
branches checked out as worktrees under `.claude/worktrees/`. **Check this
ledger before assuming something is missing from master or starting it fresh.**
Update it when you open or land a branch (RULES.md §8.3).

Snapshot: 2026-07-15.

## ⚠ Orientation facts

- The **main checkout** `/Users/gregchambers/autonovel` sits on
  `autonovel/the-last-human-ceo` (an archive branch), *not* master.
- `books/zero-trust-reality/` on master is a stale clone of TLHC; the real
  *Defense Against the Dark Arts* book is on
  `spz/zero-trust-research-analysis-24ce8e` (unmerged).

## Active work branches (unmerged into master)

| Branch | Worktree | Carries | Status |
|---|---|---|---|
| `spz/studio-repo-docs-setup-efc7a9` | `studio-repo-docs-setup-efc7a9` | **this** — studio docs set, rules, asset-mcp integration | in progress |
| `spz/zero-trust-research-analysis-24ce8e` | `zero-trust-research-analysis-24ce8e` | *Defense Against the Dark Arts* full draft (13 modules, ~57k words) + audiobook readiness | book LIVE as podcast; **merge to master needed** |
| `spz/digital-insurgency-2nd-edition-09052d` | `digital-insurgency-2nd-edition-09052d` | DI 2E: 14-ep audio field course + interactive Next.js course site (deployed to Cloud Run) | future 2E work continues here |
| `spz/x-profile-integration-c32b12` | `x-profile-integration-c32b12` | `x/` — X @spaceshipalpha9 client (`xclient.py`/`xcli.py`, Tweepy v2) | working; unmerged |
| `spz/cloud-run-mcp-assets-578774` | `cloud-run-mcp-assets-578774` | asset-mcp (was **uncommitted** there — branch tip equals master) | code copied into this branch 2026-07-15; original worktree can be retired after merge |
| `spz/last-human-ceo-audiobook-7bb567` | `last-human-ceo-audiobook-7bb567` | TLHC audiobook production (Act 1 done; slots 10–29 pending greenlight) | paused for greenlight |
| `spz/suno-zero-kat-voices-734e42` | `fervent-driscoll-47742e` | Suno voice work (ZERO/KAT) | — |
| `album-release-tmp` | `mystifying-hertz-fe888c` | *Signal Finds Signal* album release prep | lyrics rewrite already recovered to master (1754e5d) |
| `spz/sa9-studio-web-2026-07` | — (pushed to origin) | SA9 studio web work | — |
| `spz/spaceship-spacepirate-refresh-517692` | — | site refresh | — |
| `spz/relaxed-panini-37ed19` | `sitemap-problem-972312` | sitemap fix work | tip == master parent, likely done/stale |
| `spz/jovial-hodgkin-726069`, `spz/zen-heyrovsky-aacee1`, `spz/fervent-driscoll-47742e`, `spz/sitemap-problem-972312` | assorted | scratch/auto-named sessions | triage & delete when confirmed landed |

## Archive branches (frozen history — do not build on)

| Branch | Book |
|---|---|
| `autonovel/digital-insurgency` | Digital Insurgency pre-monorepo history |
| `autonovel/the-last-human-ceo` | TLHC pre-monorepo history (main checkout sits here) |
| `autonovel/zero-trust-reality` | pre-monorepo history (content had already become TLHC) |
| `autonovel/studio` | film/script *studio* treatment of TLHC |
| `origin/autonovel/bells` | *The Second Son of the House of Bells* (first novel; intentionally not in monorepo) |

## Remotes

| Remote | URL | Role |
|---|---|---|
| `origin` | github.com/space-pirate-zero/autonovel | the studio repo |
| `spz` | github.com/space-pirate-zero/digital-insurgency | DI standalone mirror |
| `osmix` | github.com/osmix/autonovel | secondary mirror |
| `upstream` | github.com/NousResearch/autonovel | original fork source (read-only) |

## Debt / follow-ups

1. **Merge Defense Against the Dark Arts** over `books/zero-trust-reality/`.
2. **Merge this docs branch** to master.
3. Land or retire `x/`, DI-2E, and audiobook branches; then prune the
   scratch worktrees (`git worktree remove` + branch delete).
4. Move the main checkout off the archive branch onto master.
