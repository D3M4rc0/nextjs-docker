# syntax=docker/dockerfile:1.7

FROM oven/bun:1-slim AS base
ENV NODE_ENV=production

# build layer
FROM base AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,target=/app/.next/cache \
    bun run build --no-lint

# runtime — minimal, uses Next standalone
FROM node:22-slim AS runner

ARG GIT_REPOSITORY_URL
ARG GIT_COMMIT_SHA

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# nonroot user
RUN groupadd -g 1001 nodejs || true
RUN useradd -r -u 1001 -g nodejs service-user || true

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER service-user
EXPOSE 3000
CMD ["node", "server.js"]
