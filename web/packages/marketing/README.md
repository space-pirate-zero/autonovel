# @sa9/marketing

> Shared SEO, metadata, structured-data, and robots/sitemap helpers for every SA9 marketing site.

The SA9 marketing cloud runs as a fleet of per-site Next.js pods (see `infra/sa9-sites/`). Every site needs the same SEO primitives — title templates, OpenGraph tags, JSON-LD, robots.txt rules, web-vitals reporting. This package is the one place those live. Sites import what they need; nobody hand-rolls another `structured-data.ts`.

**Status:** Active · **Used by:** `website`, `sites/tradecraft`, `apps/ghostdeck-web`, `apps/darkwave-web`, `apps/stylelift/apps/spz`, `sites/stylelift` (planned) · **Tests:** 297 passing across 8 files

---

## What's inside

```
packages/marketing/
  src/
    seo/
      meta-tags.ts          # generateSiteMetadata() + product presets (SA9_META, STYLELIFT_META, …)
      structured-data.ts    # JSON-LD: Organization, WebSite, SoftwareApplication, Article, FAQPage,
                            #         BreadcrumbList, Person, VideoObject
      robots-helpers.ts     # standardRobots() + AI_CRAWLER_USER_AGENTS, SEARCH_ENGINE_USER_AGENTS,
                            #         SOCIAL_PREVIEW_USER_AGENTS constants
      sitemap-helpers.ts    # staticPages(), localizedPages(), COMMON_SA9_PAGES
      web-vitals.ts         # reportWebVitals() — ships CLS/LCP/TTFB/INP/FCP to PostHog
      index.ts              # public barrel
    __tests__/              # vitest suites + blackbox contract tests
```

## Public API (highlights)

```ts
import {
  // Meta tags
  generateSiteMetadata,
  SA9_META, STYLELIFT_META, DARKWAVE_META, GHOSTDECK_META,
  TRADECRAFT_META, GROCERY_NINJA_META, PHANTOM_TILES_META, REWIND_TV_META,

  // Structured data
  organizationJsonLd, websiteJsonLd, softwareAppJsonLd,
  articleJsonLd, faqPageJsonLd, breadcrumbJsonLd,
  personJsonLd, videoObjectJsonLd,

  // Robots / sitemap
  standardRobots, AI_CRAWLER_USER_AGENTS, SEARCH_ENGINE_USER_AGENTS,
  staticPages, COMMON_SA9_PAGES,

  // Web vitals
  reportWebVitals,
} from "@sa9/marketing/seo";
```

### Minimum integration (per site)

```tsx
// app/layout.tsx
import { STYLELIFT_META } from "@sa9/marketing/seo";
export const metadata = STYLELIFT_META;
```

```ts
// app/robots.ts
import { standardRobots } from "@sa9/marketing/seo";
export default () => standardRobots("https://stylelift.fashion/sitemap.xml");
```

```ts
// app/sitemap.ts
import { staticPages, COMMON_SA9_PAGES } from "@sa9/marketing/seo";
export default () => staticPages("https://stylelift.fashion", COMMON_SA9_PAGES);
```

## Contract tests (blackbox)

`src/__tests__/blackbox.test.ts` treats the package as a sealed unit and enforces cross-cutting invariants — they live here so a change to any single product can't silently break the ecosystem:

- Every JSON-LD output has `@context: https://schema.org` and a string `@type`
- No preset shares a `metadataBase`, `title`, or `description` with another preset
- All CTA hrefs are relative paths; organization social URLs are HTTPS
- `Googlebot` is **never** in the AI crawler blocklist (regression guard)
- `noIndex: true` mode blocks everything for all user agents
- JSON-LD values round-trip through `JSON.stringify`/`parse` cleanly (XSS can't corrupt the output)

Run them: `npx vitest run` (inside `packages/marketing/`).

## Optional peer: `web-vitals`

`reportWebVitals()` uses a dynamic import of the `web-vitals` package so the consumer site is responsible for installing it. We use the variable-indirection pattern to keep TypeScript from trying to resolve the module at compile time in this package:

```ts
const specifier = "web-vitals";
(import(specifier) as Promise<WebVitalsModule>)
  .then(({ onCLS, onLCP, onTTFB, onINP, onFCP }) => { … })
  .catch(() => { /* silently degrade */ });
```

If the host page has `posthog-js` on `window.posthog`, each metric is captured as `$web_vitals` with the standard PostHog property names. No PostHog? No problem — the module is a no-op.

## Consumption via `file:` protocol

The package is consumed with pnpm's `file:` protocol (no workspace protocol):

```json
"@sa9/marketing": "file:../packages/marketing"
```

Because `file:` **hard-copies** the package into `.pnpm/@sa9+marketing@file+…`, edits to this package don't propagate to consumers until you run `pnpm install` at the consumer (or root). After editing this package, run:

```bash
pnpm install  # inside the consumer site that needs the refresh
```

## Scripts

```bash
npx tsc --noEmit   # typecheck (no package.json script wrapper)
npx vitest run     # 297 tests
```
