# @stylelift/spz -- Space Pirate Zero

> The Space Pirate Zero platform -- Greg Chambers' tech + innovation site. Built with Next.js 15 and Google Genkit for AI-powered content. Cross-linked with StyleLift for SEO and brand presence.

**[StyleLift](../../README.md)** · **Apps:** [Web](../web/README.md) · [iOS](../ios/README.md) · [Apple TV](../apple-tv/README.md) · [Shopify App](../shopify-app/README.md) · [Creator Portal](../creator-portal/README.md) · [Admin](../admin/README.md) · [Extension](../extension/README.md) · [SPZ](../spz/README.md) · **Services:** [API](../../services/api/README.md) · [AI](../../services/ai/README.md) · [Workers](../../services/workers/README.md) · [Webhooks](../../services/webhooks/README.md) · [MCP](../../services/mcp/README.md) · **Packages:** [DB](../../packages/db/README.md) · [Types](../../packages/types/README.md) · [UI](../../packages/ui/README.md) · [API Client](../../packages/api-client/README.md) · [Config](../../packages/config/README.md) · **Infra:** [Infrastructure](../../infrastructure/README.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| AI | Google Genkit + `@genkit-ai/google-genai` |
| UI | Radix UI primitives, Tailwind CSS, Lucide icons |
| Forms | React Hook Form + Zod resolvers |
| Charts | Recharts |
| Physics | Matter.js |
| Backend | StyleLift API (Fastify) |
| RSS | `rss-parser` |

**Port:** `9003` (dev) / `3004` (prod) · **Package:** `@stylelift/spz`

---

## Getting Started

```bash
# From monorepo root
pnpm install
pnpm --filter @stylelift/spz dev    # Dev server on port 9003
```

Requires `GOOGLE_GENAI_API_KEY` in environment.

---

## Project Structure

```text
src/
|-- ai/                     # Genkit AI integration
|-- app/                    # Next.js App Router pages
|-- components/             # React components
|-- api/                    # API client configuration
|-- hooks/                  # Custom React hooks
|-- lib/                    # Utilities
+-- types/                  # TypeScript definitions
```

---

## Features

- **AI Content** -- Genkit-powered AI content generation and interaction
- **Real-Time Analytics** -- Site analytics stored in Redis, consumed by Admin + Apple TV dashboards
- **Physics Animations** -- Matter.js for interactive visual effects
- **RSS Integration** -- Content aggregation from external feeds
- **SEO Cross-Linking** -- Strategic cross-linking with StyleLift for SEO authority

---

## Scripts

```bash
pnpm --filter @stylelift/spz dev        # Dev server on port 9003
pnpm --filter @stylelift/spz build      # Production build
pnpm --filter @stylelift/spz start      # Start on port 3004
pnpm --filter @stylelift/spz lint       # ESLint
pnpm --filter @stylelift/spz typecheck  # TypeScript check
```

---

## Deployment

- **Dockerfile:** `infrastructure/docker/Dockerfile.spz`
- **K8s:** `infrastructure/k8s/base/spz-deployment.yaml`
- Deployed to GKE alongside StyleLift services
