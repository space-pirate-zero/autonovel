# Spaceship Alpha 9 — Studio Repo Migration Plan

**Goal:** Make **autonovel** the base of the **Space‑Ship‑Alpha‑9 Studio** monorepo — the single home for the *studio side* of the business (books, web, marketing, SEO, brand). The *hardcore products* stay in the `space-pirate-zero/SpaceShipAlpha9` repo.

**Division of responsibility**

| Studio side → **autonovel** | Products → **SpaceShipAlpha9** |
| --- | --- |
| Books (`books/`, `chapters/`, `typeset/`, `kdp/`) | GhostDeck, DARKWAVE, TradeCraft |
| Marketing web: **spaceshipalpha9.co**, **spacepiratezero.com** | StyleLift app, OSMIX |
| Brand kit (`brand/`), art generation | Product infra / k8s / GKE |
| Substack / dispatches (`substack/`) | Product-specific packages |
| SEO, press, publishing (`publishing/`) | Hardcore product code + data |

---

## What landed in this commit (this week's work)

Committed under `web/` — a snapshot of the studio-web work from this session:

- `web/sa9-website/` — the **spaceshipalpha9.co** Next.js app. Reimagined `/products`, `/consulting`, `/about` (comic dossier), `/studio` (Dispatches merged in), `/manifesto`, `/press` (SEO press room), `/contact`; world-class `/sites/[slug]` product template; matrix rain, spotlight hero, logo mark; PostHog neuro telemetry.
- `web/spz-site/` — the **spacepiratezero.com** Next.js app (from `apps/stylelift/apps/spz`). OSINT/red-team dossier node, lasthumanceo + book link syncs.
- `web/packages/{analytics,marketing,auth}/` — shared `@sa9/*` packages the sites depend on.
- `web/platform/signal-corps/` — a build dependency of the sites.
- `web/links.json` — canonical link registry (operator, sites, socials, books, booking).
- **Generated brand assets** (in `web/sa9-website/public/images/`): real-likeness SPZ + Daniela anime portraits (`spz/`), the comic dossier panels (`about/comic/`), the 8 manifesto emblems + hero, the 10 SA9 brand scenes, the Maneki Neko Death Cult cover, product screenshots, transparent hero cutouts.

> ⚠️ This is a **snapshot to preserve the work**, not yet a wired-up workspace. The `@sa9/*` packages are referenced as `file:../packages/...` from the original monorepo layout, so paths need re-pointing before `pnpm install`/`build` will run here (see Phase 2).

---

## Migration phases

### Phase 1 — Save the work ✅ (this commit)
Studio-web source + generated assets copied into `web/`. Build artifacts and `node_modules` excluded via `web/.gitignore`.

### Phase 2 — Make it a working workspace in autonovel
1. Add a root (or `web/`) `pnpm-workspace.yaml` covering `web/sa9-website`, `web/spz-site`, `web/packages/*`, `web/platform/*`.
2. Re-point each app's `@sa9/*` deps to `workspace:*` (currently `file:../packages/...`).
3. `pnpm install` at the workspace root; fix any lockfile drift.
4. Verify `pnpm --filter sa9-website build` and `pnpm --filter spz build` succeed.

### Phase 3 — Deploy from autonovel (Cloud Run)
The current SpaceShipAlpha9 deploy tooling is **stale/broken** and must be rebuilt here:
- Deploy is **Cloud Run** (services `sa9-website`, `spz` in project `stylelift`, region `us-central1`), **not** GKE. The repo's `deploy.sh` / `deploy-marketing.yml` / README are all GKE and dead.
- **Known build bug:** the Dockerfiles use Node 20 with an unpinned pnpm; corepack now pulls pnpm 11.13.0 which needs Node 22's `node:sqlite` → `pnpm install` crashes. **Fix: pin pnpm** (`corepack prepare pnpm@10.15.1 --activate`) or bump base to `node:22-alpine`.
- Bring over `infra/sa9-sites/docker/Dockerfile.sa9-website` + `Dockerfile.spz` (with the pnpm fix), plus `NEXT_PUBLIC_*` build args from Secret Manager (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `CLERK_PUBLISHABLE_KEY`).
- Author `cloudbuild.yaml` per site → `gcloud builds submit` → `gcloud run deploy <svc> --image ...` (deploy `--no-traffic` first, verify, then migrate traffic).
- Wire a **Cloud Build trigger** on push (there is none today — the last deploy was manual in April).

### Phase 4 — Consolidate marketing / SEO / brand
- Point the sites' data at autonovel's canonical sources (`books/` for the slate, `brand/spz/` for the brand kit, `substack/` for dispatches) instead of duplicated lists.
- Move the art-generation scripts (`gen_*.py`) into a shared `studio/` tooling area used by both books and web.
- Single SEO source of truth (sitemaps, structured data, `links.json`).

### Phase 5 — Shared-package strategy
`@sa9/analytics`, `@sa9/marketing`, `@sa9/auth` are used by **both** studio web (here) and products (SpaceShipAlpha9). Decide:
- **(a)** Publish them to a private registry (GitHub Packages) and consume by version in both repos, **or**
- **(b)** Keep the canonical copy here and mirror into SpaceShipAlpha9 at release, **or**
- **(c)** Git submodule.
Recommendation: **(a)** private registry — cleanest for two consumers.

### Phase 6 — Decommission the studio bits from SpaceShipAlpha9
Once autonovel builds + deploys the two sites, remove `website/` and `apps/stylelift/apps/spz/` from SpaceShipAlpha9 (leave a pointer in its README), so each repo owns its half cleanly.

---

## Open decisions for the operator
- Final folder layout: `web/` vs `sites/` vs top-level `apps/`.
- Whether books + web share one pnpm/turbo workspace or stay parallel toolchains (Python books + Node web).
- Registry choice for the shared packages (Phase 5).
- Domain/DNS ownership stays as-is (Cloudflare); only the deploy source repo changes.
