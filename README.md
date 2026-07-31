<p align="center">
  <img src=".github/assets/banner.svg" alt="hatohui-workspace" width="100%" />
</p>

# hatohui-workspace

A management ecosystem/platform for hatohui and friends. A single monorepo holding frontend, backend, and infra together.

## Pipelines

[![api-cd](https://github.com/hatohui/hatohui-workspace/actions/workflows/api-cd.yml/badge.svg)](https://github.com/hatohui/hatohui-workspace/actions/workflows/api-cd.yml)
[![friends-cd](https://github.com/hatohui/hatohui-workspace/actions/workflows/friends-cd.yml/badge.svg)](https://github.com/hatohui/hatohui-workspace/actions/workflows/friends-cd.yml)
[![www-cd](https://github.com/hatohui/hatohui-workspace/actions/workflows/www-cd.yml/badge.svg)](https://github.com/hatohui/hatohui-workspace/actions/workflows/www-cd.yml)
[![infra-cd](https://github.com/hatohui/hatohui-workspace/actions/workflows/infra-cd.yml/badge.svg)](https://github.com/hatohui/hatohui-workspace/actions/workflows/infra-cd.yml)
[![db-migrate-cd](https://github.com/hatohui/hatohui-workspace/actions/workflows/db-migrate-cd.yml/badge.svg)](https://github.com/hatohui/hatohui-workspace/actions/workflows/db-migrate-cd.yml)

## Apps

| App | Stack | Purpose | URL |
| --- | --- | --- | --- |
| [`apps/api`](apps/api) | NestJS, Prisma (Postgres) | Shared API service for all other apps. | [api.hatohui.com](https://api.hatohui.com) |
| [`apps/friends`](apps/friends) | React, Vite | Helps you be a good friend — reminders, and finding your friends' friends. | [friends.hatohui.com](https://friends.hatohui.com) |
| [`apps/www`](apps/www) | React, Vite | Index/portfolio site for hatohui's (personal) profile and other apps. | [www.hatohui.com](https://www.hatohui.com) |
| `apps/art` | _planned_ | Hatohui's art tracker — commissions, gallery, timeline, income. | `art.hatohui.com` |
| `apps/travel` | _planned_ | Travel planning and management, for furries. | `travel.hatohui.com` |
| `apps/workspace` | _planned_ | Config, monitoring, and task/deadline management across the other apps. | `workspace.hatohui.com` |

## Packages

| Package | Purpose |
| --- | --- |
| [`@hatohui/models`](packages/models) | Typed API client shared between backend and frontends. |
| [`@hatohui/ui`](packages/ui) | Shared visual components and design tokens. |
| [`@hatohui/libs`](packages/libs) | Shared cross-cutting frontend logic. |
| [`@hatohui/i18n`](packages/i18n) | Shared translations and i18n setup. |
| [`@hatohui/tools`](packages/tools) | Shared utility functions. |
| [`@hatohui/assets`](packages/assets) | Shared static assets. |
| [`@hatohui/config`](packages/config) | Shared app configuration. |

## Tooling

- **Package manager:** [Bun](https://bun.sh) — `bun install`, `bun add`, `bun run`. No npm/pnpm/yarn.
- **Task runner:** [Task](https://taskfile.dev) — run `task` with no args to list everything.
- **Local infra:** Postgres, MinIO, Mailpit, Redis via the root `docker-compose.yml`.
- **Infra as code:** Terraform (`infra/`).

See [docs/conventions.md](docs/conventions.md) for the full conventions doc.

## Getting started

Prerequisites: [Node.js](https://nodejs.org), [Docker](https://www.docker.com), [Task](https://taskfile.dev).

```bash
task setup
```

That's it — `task setup` installs Bun and the Doppler CLI if you don't have them, logs you into Doppler, installs dependencies, syncs `.env` files, and starts/migrates/seeds the local database.

Then run an app's dev server with its task, e.g. `task app:friends`.

## Notable commands

| Command | Use it when |
| --- | --- |
| `task app:<app_name>` | Starting an app's dev server. |
| `task app:openapi:generate` | There's new model or API changes. |
| `task db:migrate` | You changed the database schema. |
| `task db:seed` | You want to reseed the local database. |
| `task db:studio` | You want to browse or edit local data. |
| `task infra:start` | Local infra isn't running. |
