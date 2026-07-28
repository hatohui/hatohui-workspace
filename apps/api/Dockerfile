FROM oven/bun:1.3.12 AS builder
WORKDIR /repo

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/friends/package.json apps/friends/package.json
COPY apps/www/package.json apps/www/package.json
COPY packages/i18n/package.json packages/i18n/package.json
COPY packages/libs/package.json packages/libs/package.json
COPY packages/models/package.json packages/models/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api

WORKDIR /repo/apps/api
ENV DATABASE_URL=postgresql://user:password@localhost:5432/placeholder

RUN bunx prisma generate
RUN bun run build

FROM node:22-slim AS runtime

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /repo
COPY --from=builder /repo/node_modules node_modules
COPY --from=builder /repo/apps/api/node_modules apps/api/node_modules
COPY --from=builder /repo/apps/api/package.json apps/api/package.json
COPY --from=builder /repo/apps/api/dist apps/api/dist
COPY --from=builder /repo/apps/api/prisma apps/api/prisma

WORKDIR /repo/apps/api
ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/main.js"]
