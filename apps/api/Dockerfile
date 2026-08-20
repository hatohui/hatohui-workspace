FROM oven/bun:1.3.12 AS base
WORKDIR /repo

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/art/package.json apps/art/package.json
COPY apps/friends/package.json apps/friends/package.json
COPY apps/www/package.json apps/www/package.json
COPY apps/workspace/package.json apps/workspace/package.json
COPY packages/assets/package.json packages/assets/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/libs/package.json packages/libs/package.json
COPY packages/models/package.json packages/models/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/tools/package.json packages/tools/package.json
COPY apps/api/prisma apps/api/prisma

ENV DATABASE_URL=postgresql://user:password@localhost:5432/placeholder

FROM base AS builder
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile --filter=./apps/api

COPY apps/api apps/api

WORKDIR /repo/apps/api
RUN bunx prisma generate
RUN bun run build

FROM base AS deps
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile --production --filter=./apps/api

WORKDIR /repo/apps/api
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bunx prisma generate

FROM node:22-slim AS runtime

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /repo
COPY --from=deps /repo/node_modules node_modules
COPY --from=deps /repo/apps/api/node_modules apps/api/node_modules
COPY --from=deps /repo/apps/api/prisma apps/api/prisma
COPY --from=builder /repo/apps/api/package.json apps/api/package.json
COPY --from=builder /repo/apps/api/dist apps/api/dist

WORKDIR /repo/apps/api
ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/main.js"]
