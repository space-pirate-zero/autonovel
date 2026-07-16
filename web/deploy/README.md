# Studio Web — Deploy Runbook (Cloud Run)

The studio marketing sites run on **Cloud Run** in project `stylelift`, region `us-central1`:

| Service | Domain | Source |
| --- | --- | --- |
| `sa9-website` | spaceshipalpha9.co | `web/sa9-website/` |
| `spz` | spacepiratezero.com | `web/spz-site/` |

> The old GKE tooling (`deploy.sh`, GitHub Actions `deploy-marketing.yml`) is **dead** — it startup-fails and targets a drained cluster. Cloud Run is the source of truth. There is currently **no push-to-deploy trigger**; deploys are the manual steps below.

## Prerequisites
- `gcloud` authed as an account with Cloud Build + Cloud Run + Artifact Registry access on project `stylelift`.
- Build args come from Secret Manager (all public `NEXT_PUBLIC_*` / publishable keys):
  - `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `CLERK_PUBLISHABLE_KEY`

## Build args reference (baked at build time by Next.js)
```bash
PHK=$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_POSTHOG_KEY   --project=stylelift)
PHH=$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_POSTHOG_HOST  --project=stylelift)
CKPK=$(gcloud secrets versions access latest --secret=CLERK_PUBLISHABLE_KEY    --project=stylelift)
```

## Deploy `sa9-website`
```bash
TAG="site-$(date +%Y%m%d-%H%M)"
# 1. Build the image (Cloud Build; ~3 min)
gcloud builds submit --project=stylelift --config=web/deploy/cloudbuild.sa9.yaml \
  --substitutions=_PHK="$PHK",_PHH="$PHH",_CKPK="$CKPK",_TAG="$TAG" .
# 2. Deploy with NO live traffic + a preview tag
gcloud run deploy sa9-website --project=stylelift --region=us-central1 \
  --image="us-central1-docker.pkg.dev/stylelift/sa9-sites/sa9-website:$TAG" \
  --no-traffic --tag=refresh --quiet
# 3. Verify the preview (https://refresh---sa9-website-...run.app) — check EVERY public page returns 200
# 4. Migrate 100% traffic
gcloud run services update-traffic sa9-website --project=stylelift --region=us-central1 --to-latest --quiet
```
Deploy `spz` identically with `cloudbuild.spz.yaml` and service name `spz`.

## Gotchas fixed here (do not regress)
1. **pnpm/Node** — Dockerfiles run Node 20; an unpinned pnpm pulls 11.x which needs Node 22's `node:sqlite`. The Dockerfiles here **pin `pnpm@10.15.1`** (`corepack prepare`). Keep it (or move base to `node:22-alpine`).
2. **Prod type errors** — `next build` fails on pre-existing type-only issues (posthog-js drift, strict-null, signal-corps resolution). Each site's `next.config.ts` sets `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds`. Dev already tolerated these; runtime is unaffected.
3. **Clerk allowlist** — passing a real `CLERK_PUBLISHABLE_KEY` activates Clerk, which **404s any route not in `publicRoutes`**. `web/sa9-website/src/middleware.ts` now lists every public marketing page (`/consulting`, `/studio`, `/manifesto`, `/press`, `/music`, `/dispatches`, `/faq`, `/connect`, …). Add new public pages here.

## Build-context note
`cloudbuild.*.yaml` reference `infra/sa9-sites/docker/Dockerfile.*` and a monorepo-root context (the SpaceShipAlpha9 layout the build was extracted from). To build **from autonovel's** `web/` layout, the Dockerfiles' `COPY` paths and the cloudbuild `-f` path need re-pointing to `web/…` — see Phase 2/3 of `web/STUDIO-MIGRATION-PLAN.md`. The copies in `web/deploy/docker/` are the working reference to adapt.
