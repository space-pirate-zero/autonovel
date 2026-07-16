# @sa9/signal-corps

> Broadcast management for SA9 — queue, format, and publish posts across Twitter, LinkedIn, Facebook, Instagram, Bluesky, Reddit, and Substack with UTM attribution that feeds back into PostHog.

**Status:** Active (scaffold) · **Runtime:** Node.js 20+ · **Queue:** BullMQ + Redis · **Used by:** `website/src/app/api/signal-corps/**`

---

## What it does

Signal Corps is the engine that powers the Broadcasts feature in the SA9 iOS command center. The iOS app composes a post, picks target platforms, picks a schedule, and POSTs the result to `website/src/app/api/signal-corps/broadcasts/*`. That route calls this package to:

1. **Format** — `formatForPlatform()` rewrites the post per platform (Twitter 280 chars, Bluesky 300 chars, Reddit flair, LinkedIn visibility, …)
2. **Attribute** — `attributeLink()` injects UTM params so PostHog can tie traffic back to the broadcast ID
3. **Enqueue** — `enqueueBroadcast()` or `scheduleBroadcastAt()` pushes the job onto a BullMQ queue backed by Redis
4. **Publish** — `startBroadcastWorker()` drains the queue, looks up OAuth tokens via a registered `TokenStore`, picks the right `PlatformAdapter`, and fires the post
5. **Report** — `getMetrics()` polls each platform for impressions/likes/comments after publication

## Public API

```ts
import {
  // Types
  Platform,
  Broadcast, PlatformResult, PostTemplate, PlatformMetrics, OAuthTokens,
  PLATFORM_CHAR_LIMITS,

  // Attribution
  generateUtmParams, buildAttributedUrl, attributeLink,

  // Formatter
  formatForPlatform, FormattedPost,

  // Adapters
  getAdapter, getAllAdapters,
  TwitterAdapter, LinkedInAdapter, FacebookAdapter,
  InstagramAdapter, BlueskyAdapter, RedditAdapter, SubstackAdapter,

  // Queue + worker + scheduler
  QUEUE_NAME, getBroadcastQueue,
  enqueueBroadcast, scheduleBroadcast, scheduleBroadcastAt,
  cancelScheduledBroadcast, rescheduleBroadcast, getScheduledBroadcasts,
  registerTokenStore, startBroadcastWorker,
  TokenStore, BroadcastJobData, BroadcastJobResult,

  // Utilities
  withRetry, fetchWithRetry, logger,
} from "@sa9/signal-corps";
```

## Architecture

```
platform/signal-corps/
  src/
    types.ts              # Platform enum + Broadcast, PlatformResult, OAuthTokens, PlatformMetrics
    attribution.ts        # UTM param generator + link rewriter
    adapters/             # Per-platform publish + metrics (twitter, linkedin, facebook,
                          #   instagram, bluesky, reddit, substack)
    templates/
      formatter.ts        # formatForPlatform() — char limits, hashtags, link handling
    queue/
      broadcast-queue.ts  # BullMQ queue + enqueue / schedule
      broadcast-worker.ts # Worker that drains the queue and calls adapters
      scheduler.ts        # scheduleBroadcastAt + reschedule / cancel
    lib/
      retry.ts            # withRetry + fetchWithRetry
      logger.ts           # Pino logger
    index.ts              # public barrel
```

## Consumer wiring (website API routes)

```ts
// website/src/app/api/signal-corps/broadcasts/[id]/schedule/route.ts
import { scheduleBroadcastAt, Platform, cancelScheduledBroadcast } from "@sa9/signal-corps";

const broadcast = {
  id, title, content,
  platforms: stored.platforms as Platform[],
  scheduledAt,
  status: "scheduled" as const,
  results: [],
  createdAt: new Date(stored.createdAt),
  updatedAt: new Date(),
};
const info = await scheduleBroadcastAt(broadcast, tokenOwnerId, scheduledAt);
```

## TypeScript strictness (`exactOptionalPropertyTypes: true`)

Adapters construct platform-result literals dynamically — many optional fields come back as `undefined` from upstream API responses. To keep `exactOptionalPropertyTypes` happy, every optional field on `PlatformResult`, `PlatformMetrics`, `PostTemplate`, `Broadcast`, `OAuthTokens`, and `FormattedPost` is typed as `field?: T | undefined` (not just `field?: T`). Don't drop the `| undefined` — the adapters will break.

## Build + typecheck

```bash
cd platform/signal-corps
npm install
npm run build     # → dist/ (tsc)
npm run dev       # tsc --watch
npm run lint      # tsc --noEmit
```

The package is consumed via pnpm's `file:` protocol:

```json
"@sa9/signal-corps": "file:../platform/signal-corps"
```

Which means `dist/` **must exist** at consumer install time — always run `npm run build` here before `pnpm install` in a consumer.

## What this package does *not* do

- **OAuth flows** — the app has its own OAuth callback routes under `website/src/app/api/auth/callback/[platform]`. Signal Corps only consumes `OAuthTokens` via a `TokenStore` you register.
- **Broadcast persistence** — the `broadcastStore` is an in-memory map in `website/src/app/api/signal-corps/broadcasts/route.ts`. Swap it for a real database when the iOS app starts relying on it across restarts.
- **Scheduling UI** — owned by the iOS command center (`apps/sa9-ios`).
