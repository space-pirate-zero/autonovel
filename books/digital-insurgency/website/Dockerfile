# Digital Insurgency web — Cloud Run (Next.js standalone).
# content/ is pre-generated locally (build-content.mjs needs the book source, which
# is NOT in this context) and shipped in the build context, so the image build skips
# the content step and runs `next build` directly.
FROM node:22-slim AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --prod=false --no-frozen-lockfile --config.minimum-release-age=0

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec next build

FROM base AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 8080
CMD ["node", "server.js"]
