# ══════════════════════════════════════════════════
# SA9 Website — Multi-Stage Dockerfile
# Target: ~200-300MB production image
# ══════════════════════════════════════════════════

# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set manage-package-manager-versions false && \
    pnpm approve-builds esbuild sharp unrs-resolver 2>/dev/null; \
    pnpm install --frozen-lockfile || pnpm install

# ── Stage 2: Builder ──
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Stage 3: Runner (Production) ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 sa9 && \
    adduser --system --uid 1001 sa9

COPY --from=builder --chown=sa9:sa9 /app/.next/standalone ./
COPY --from=builder --chown=sa9:sa9 /app/.next/static ./.next/static
COPY --from=builder --chown=sa9:sa9 /app/public ./public
RUN sed -i '/"packageManager"/d' package.json 2>/dev/null || true

USER sa9

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# ── Development Target ──
FROM node:22-alpine AS development
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set manage-package-manager-versions false && \
    pnpm approve-builds esbuild sharp unrs-resolver 2>/dev/null; \
    pnpm install
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["pnpm", "dev"]
