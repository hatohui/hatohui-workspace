# Build context is the monorepo root (needed to resolve the Bun workspace lockfile).
# Build: docker build -f apps/api/Dockerfile -t hatohui-api .

FROM oven/bun:1 AS builder
WORKDIR /repo

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api
WORKDIR /repo/apps/api
RUN bunx prisma generate
RUN bun run build

FROM node:22-slim AS runtime
WORKDIR /app

# AWS Lambda Web Adapter: runs this image's normal HTTP server (see CMD below)
# behind the Lambda Runtime API, no handler code required.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.1 /lambda-adapter /opt/extensions/lambda-adapter

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/node_modules ./node_modules
COPY --from=builder /repo/apps/api/package.json ./package.json
COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /repo/apps/api/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/main.js"]
