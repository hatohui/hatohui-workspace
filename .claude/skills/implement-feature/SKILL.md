---
name: implement-feature
description: End-to-end workflow for shipping a new backend-touching feature in hatohui-workspace — planning, Prisma schema/migrations, Doppler secrets, infra wiring, NestJS API code, OpenAPI/Orval codegen, and frontend wiring across apps/* and packages/*. Use when asked to implement, add, build, or ship a new feature that touches apps/api and/or shared packages.
---

The end-to-end recipe for a feature that touches `apps/api` and needs new
env vars/secrets, new API endpoints, and frontend consumption. Follow the
steps in order — each one depends on the last actually being done, not just
planned.

One API, several frontends. `apps/api` is the single backend for every
frontend in the monorepo, so treat "which app is this for?" as a real
question with a real answer, never an assumption that it is `friends`.

## 0. Before anything

Read `docs/conventions.md` in full. This is mandatory per `CLAUDE.md`, not
optional context — it covers Nest layout, Prisma setup, OpenAPI/Orval naming,
React app structure, and lint/format rules that the rest of this skill
assumes you already know.

## 1. Planning

### Know the estate before you scope

Re-derive this list rather than trusting it — directories get added — but as
of writing:

| Directory        | State                    | Frontend? | CD workflow      |
| ---------------- | ------------------------ | --------- | ---------------- |
| `apps/api`       | scaffolded (NestJS)      | —         | `api-cd.yml`     |
| `apps/friends`   | scaffolded (React SPA)   | yes       | `friends-cd.yml` |
| `apps/art`       | scaffolded (React SPA)   | yes       | `art-cd.yml`     |
| `apps/www`       | scaffolded (React SPA)   | yes       | `www-cd.yml`     |
| `apps/travel`    | placeholder, no `package.json` | —   | none             |
| `apps/workspace` | placeholder, no `package.json` | —   | none             |

Check with `ls apps/*/package.json` — a directory without one is a
placeholder and there is nothing there to wire.

Note the `AppScope` enum in `schema.prisma` (`ALL`, `WORKSHOP`, `ART`,
`FRIENDS`, `WWW`, `TRAVEL`) does **not** map one-to-one onto `apps/*`:
`WORKSHOP` has no directory and `workspace` has no scope. Scope values are a
data-partitioning vocabulary, not an app inventory — don't infer one from
the other.

### Then clarify with the user, once, up front

- Which app(s) need this. Ask if it is not stated; "add a settings page"
  does not say which frontend. If the answer is more than one, decide up
  front what is shared and what is per-app before writing any of it.
- Shared vs per-app: if more than one app needs the same client-side logic
  (a hook, a provider, a component), it is a `packages/*` package, built
  once. Never duplicate the same logic into two apps.
- Per-user state that more than one app will want (preferences, opt-outs,
  display choices) belongs in the generic `UserSetting` table — a
  `(userId, type, scope)` row keyed by the same vocabulary `AppConfig`
  uses for app-wide defaults. Add columns to `User` only for identity
  fields that are genuinely global to the account. The pairing is the
  point: `AppConfig` holds the default, `UserSetting` holds the override,
  and an absent row means "inherit".
- Which flow/architecture fits the constraints (e.g. multiple separate SPA
  origins sharing one API argues for token-based auth over server-side
  session redirects). Use `AskUserQuestion` for genuine architecture forks —
  but once scope is agreed, stop asking and start building. Flag decisions
  inline as you make them instead of re-confirming each one.

Grep for existing similar modules (e.g. an existing NestJS module, an
existing shared package) before inventing a new pattern.

## 2. Schema & migrations (local)

Edit `apps/api/prisma/schema.prisma`. Then, from repo root:

```bash
task db:generate   # bunx prisma generate — regenerates the Prisma client types
```

Don't run `db:migrate` yet — do that after secrets are wired (step 4), so
the API can actually boot against the new schema if you need to sanity
check anything.

## 3. Doppler secrets

Every new required env var needs to exist in **two** places before you
write code that reads it:

1. `apps/api/src/config/env.ts` — add it to the zod schema. This is the
   single source of truth for what the app requires; even libs that read
   `process.env` directly (rare, avoid it) must have their var declared
   here.
2. Doppler project `hatohui-workspace`, config **`tf`** — this is the config
   Terraform reads from (`infra/modules/secrets/config.tf`'s
   `data.doppler_secrets`), not `prod_api` (that one is a *mirror*, written
   *by* Terraform — see step 5). Use the Doppler MCP tools:
   - `mcp__doppler__secrets_list` (project=hatohui-workspace, config=tf) to
     see what's already there — don't guess or duplicate an existing value
     (e.g. `GOOGLE_OAUTH_CLIENT_ID` is already there; reuse it, don't
     re-provision).
   - Generate random secrets with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Write with `mcp__doppler__secrets_update`, passing
     `change_requests: [{ name, originalName: name, value }]`.

Never hardcode a secret value in a file, commit message, or code comment.
Local dev secrets (in `apps/api/.env`) and production secrets (in Doppler)
should usually be **different values** — generate a fresh one for prod, use
a separate one locally.

## 4. Run migrations + update secrets locally

```bash
docker compose up -d database   # if not already running (also redis/minio if the feature needs them)
task db:migrate                 # bunx prisma migrate dev — applies the new migration, prompts for a name
```

Then update `apps/api/.env` directly (it's gitignored) with the new var(s).
For values that already exist as real shared credentials (OAuth client IDs,
etc.), pull the actual value from Doppler's `tf` config via
`mcp__doppler__secrets_list` rather than inventing a placeholder — local dev
should use the same public client ID production does, for example.

## 5. Wire secrets in infra

Two separate things happen in `infra/main.tf`, and a new var may need
either or both:

- **`module.lambda`'s `environment_variables` map** — this is what the
  Lambda function actually receives at runtime. Every var `env.ts` requires
  must be here or the app will crash-loop on boot (`ZodError` in
  CloudWatch — see `/debug-prod`).
- **`module.app_secrets_api`'s `secrets` map** — mirrors the same
  credentials into Doppler's `prod_api` config, for visibility and so
  `doppler run --config prod_api -- <cmd>` (e.g. `task db:prod:apply`) can
  source them locally. If the var is one `module.secrets` sources from the
  `tf` Doppler config, add a matching `output` block in
  `infra/modules/secrets/outputs.tf` first (mirror the existing
  `session_jwt_secret` output as a template), then reference
  `module.secrets.<output_name>` in both maps above.

Once both are wired, **always** preview before touching anything live:

```bash
cd infra
doppler run --token "<tf-config-service-token>" --project hatohui-workspace --config tf --name-transformer tf-var -- terraform plan -no-color
```

(The service token itself is the `DOPPLER_TOKEN` secret inside the `tf`
Doppler config — fetch it via `mcp__doppler__secrets_list` if the local
`doppler` CLI isn't already authenticated; `doppler me` will tell you.)

Read the whole plan. Call out **any drift unrelated to your change** (a
different resource show as changing) instead of silently applying it —
that drift may be someone else's in-progress work. Get explicit user
confirmation before `terraform apply`, and prefer scoping it with
`-target=module.<x>` to only the resources your change actually touches.

## 6. Write the code in apps/api

Standard NestJS module layout under `apps/api/src/modules/<resource>/`:

```
src/modules/<resource>/
  <resource>.module.ts        # always at the module root
  <resource>.controller.ts    # stays flat while there's only one
  <resource>.constants.ts     # same — flat until a second one is needed
  services/
  guards/
  decorators/
  dto/
  utils/
```

A module is one resource, not a domain — don't group sibling resources
under one module folder (see `docs/conventions.md` for why). A type gets its
own folder only once a module needs ≥2 files of that type; `<resource>.controller.ts`
and `<resource>.constants.ts` stay flat at the root until then, and fold into
`controllers/`/`constants/` in place once a second file shows up — don't
pre-create the folder.

Non-negotiables from `docs/conventions.md`:

- Every `@ApiOperation` needs an explicit `operationId` (e.g.
  `operationId: 'createWidget'`) — without it, Orval generates an ugly hook
  name from Nest's default `<Controller>_<method>`.
- Database access goes through the `Database` injectable from `@/infra/db`
  (global `DatabaseModule`), not a new PrismaClient.
- Register the new module in `apps/api/src/app.module.ts`, and add its tag
  to `apps/api/src/bootstrap/openapi.ts`'s `DocumentBuilder`.
- Path alias `@/*` for cross-cutting imports; relative imports for
  same-directory siblings.
- One API serves every frontend, so a module is only "the friends module"
  if the data really is friends-only. Anything several apps will read
  (accounts, settings, assets, notifications) is a shared resource — scope
  the *rows* with `AppScope`, don't fork the module per app.
- If several controllers in one module share a route prefix, watch
  registration order: a `@Get(':id')` shadows any literal sibling route
  registered after it. Order comes from Nest's depth-first scan of the
  module graph, not from `app.module.ts`'s `imports` array — a module reached
  transitively through another module's `imports` registers at that point,
  which can silently defeat the order you wrote. Verify with a real request,
  not by reading the generated OpenAPI spec (it's built from decorators, so
  it looks correct either way). See `docs/specs/api/friends-controllers/`.
- No comments in `schema.prisma`, including `///` doc comments.
  `docs/conventions.md` names Prisma schema comments explicitly; the
  reasoning goes in `docs/specs/<app>/<feature>/` instead.
- Everywhere else: comment only if absolutely needed, and then only the
  **purpose**, in one line. Never narrate your reasoning or the
  decision-making behind a choice — no "your thought process" comments. If
  it's not needed, don't comment at all.

## 7. Codegen

Needs a **reachable local Postgres** (the export step boots the full Nest
app, including `DatabaseModule`'s `$connect()` — it will hang/timeout
without one):

```bash
docker compose up -d database
task app:openapi:generate   # exports the OpenAPI spec, then runs Orval
```

If Docker Desktop is not running, `docker compose up` fails with a named-pipe
error on Windows and there is no way around it — `prisma generate` works
offline (it reads the schema, not the database) but `db:migrate` and this
codegen step both genuinely need Postgres. Stop and ask the user to start
Docker rather than hand-writing a migration: Prisma auto-names indexes and
constraints, and a hand-rolled name that differs from what Prisma expects
leaves the schema permanently drifted.

`packages/models/openapi.json` and `packages/models/src/generated/` are
**committed to git in this repo** (check `.gitignore` hasn't drifted back
to ignoring them — they were deliberately un-ignored so frontend CI doesn't
need a database just to build). Commit the diff alongside your backend
change; `api-cd.yml` has a `verify-openapi-client` job that fails the build
if the committed client is stale relative to `apps/api`.

## 8. Write the code in the application(s)

- Shared, reusable client logic (a hook, a context provider, a component
  used by more than one app) → `packages/libs` (general logic) or
  `packages/ui` (visual components) or `packages/i18n` (translations).
  Never duplicate the same logic into two apps' `src/`.
- App-specific wiring — provider nesting in `main.tsx`, page components,
  routes — goes in the app itself, following its existing structure
  (`components/`, `hooks/`, `pages/` per `docs/conventions.md`'s React app
  layout).
- If a shared package uses React Query hooks generated in step 7, remember:
  the hooks need a `QueryClientProvider` ancestor, so any provider that
  wraps them must be nested **inside** `QueryClientProvider` in `main.tsx`,
  not outside it.
- Wire the new package into each consuming app's `package.json` as a
  `workspace:*` dependency, then `bun install` at repo root.

## 9. Review

- Do **not** write tests unless the user asks.
- Run lint and typecheck on everything you touched:
  ```bash
  bunx eslint --fix <changed-files-or-dirs>
  cd apps/<app> && bun run tsc -b --noEmit   # per frontend app
  cd apps/api && bunx tsc --noEmit -p tsconfig.json
  ```
- Hand the diff to the user to review themselves — don't ask them to
  re-approve decisions already agreed in step 1.

## 10. Commit, watch pipeline

Only commit when the user explicitly asks. Use the repo's existing commit
message style (short, imperative, why-focused). After pushing, tell the
user which workflows will fire based on what changed:

- `apps/api/**` changes → `api-cd.yml` (includes the `verify-openapi-client`
  gate before the Lambda deploy).
- `apps/friends/**` or `packages/**` → `friends-cd.yml`.
- `apps/art/**` or `packages/**` → `art-cd.yml`.
- `apps/www/**` or `packages/**` → `www-cd.yml`.
- `apps/api/prisma/migrations/**` → `db-migrate-cd.yml`.
- `infra/**` → `infra-cd.yml`.

A `packages/**` change fans out to **every** frontend workflow at once, so a
tweak to `packages/ui` or `packages/models` rebuilds friends, art and www
together. Say so when you push one — a shared-package change has a much
wider blast radius than an app-local one, and a regression there breaks
three deploys rather than one.

The frontend builds run straight from the committed generated client with no
database service — if step 7 was skipped or is stale, they will fail on a
missing `packages/models/src/generated/*` import.

## 11. Finish

Summarize: what changed, where. Call out anything still manual — most
commonly, Google Cloud Console settings (Authorized JavaScript
origins/redirect URIs) that Terraform cannot manage because Google exposes
no API for them (see `/debug-prod` for the exact console path and the
terraform outputs that compute the intended values).

## Rules (apply throughout, not just at the step that mentions them)

- **Shared packages live under `packages/*`, never duplicated per-app.**
  If you're about to paste the same hook into two apps, stop — it belongs
  in `packages/libs` (or `ui`/`i18n`/`models` as appropriate).
- **All credentials are scoped through `infra/` + Doppler.** Never a
  plaintext secret in a committed file, a `.env.example` placeholder aside
  (those stay empty/dummy).
- **Follow `docs/conventions.md` exactly** — Bun only (no npm/pnpm/yarn),
  Task runner for common commands, the Nest and React layouts as
  documented, explicit `operationId`s, no `any` in frontend code.
- **Confirm before any `terraform apply`** or other action that touches a
  shared or production system. `terraform plan` is free to run and show;
  applying is not.
