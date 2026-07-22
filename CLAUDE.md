# hatohui-workspace

Monorepo with `apps/*` (deployable applications) and `packages/*` (shared libraries).

## Before writing or editing any code

Read `docs/conventions.md` in full first. It covers Nest app layout, Prisma setup, OpenAPI/Orval naming, React app structure, and lint/format rules. This applies before any implementation work in this repo, not just when a request happens to mention one of those topics.

## Tooling

- **Package manager: Bun.** Do not use npm/pnpm/yarn commands or lockfiles in this repo — use `bun install`, `bun add`, `bun run`, etc.
- **Task runner:** [Task](https://taskfile.dev) (`taskfile.yml` + `taskfiles/*.taskfile.yml`) wraps common commands at the repo root.
- Local infra (Postgres, MinIO, Mailpit) runs via `docker-compose.yml`.
