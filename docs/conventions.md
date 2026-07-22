# Workspace conventions

Cross-cutting conventions for this monorepo. Per-app specs live in `docs/specs/<app>/`.

## Tooling

- **Package manager: Bun.** No npm/pnpm/yarn commands or lockfiles.
- **Task runner:** [Task](https://taskfile.dev) — `taskfile.yml` includes `taskfiles/*.taskfile.yml`. Run `task` (no args) to list everything.
- **Scripts folder:** cross-cutting tooling scripts live in the single root `scripts/`, never duplicated per-app. If a script needs an app's own dependency graph (e.g. booting a NestJS app), it must run with that app's directory as cwd, because Bun resolves bare imports relative to the executing file's location, not the invoking cwd. The pattern: add a `package.json` script in the app itself, then have the root script `spawnSync` it with `cwd` set to that app. See `scripts/export-openapi.ts` for the reference implementation.
- **Lint/format: one shared config for the whole repo.** Root `eslint.config.mjs` + root `.prettierrc` — no per-app ESLint/Prettier/oxlint configs. Per-app overrides (globals, sourceType, plugin rules) live as `files`-scoped blocks inside the root config.
- Local infra (Postgres, MinIO, Mailpit) runs via root `docker-compose.yml`.

## NestJS apps (`apps/api` and future backend apps)

Standard folder layout:

```text
src/
  config/     # env validation (zod), other startup config
  libs/       # cross-cutting infrastructure (db client, openapi doc builder, etc.) — one file per concern
  modules/
    <resource>/
      dto/
      <resource>.controller.ts
      <resource>.service.ts
      <resource>.module.ts
  app.module.ts
  main.ts
```

- **Path alias `@/*` → `src/*`.** Use it for cross-cutting imports (`@/libs/db`, `@/config/env`); same-directory sibling imports (e.g. a controller importing its own service) stay relative.
- **Env validation:** a zod schema in `src/config/env.ts`, wired via `ConfigModule.forRoot({ validate })`. Every required env var must be declared there, even if a lib (like `libs/db.ts`) reads `process.env` directly.
- **Database: Prisma.** Generator must be the classic `prisma-client-js` (the newer ESM-only `prisma-client` generator doesn't interop with this CJS build). Prisma 7 requires a driver adapter (`@prisma/adapter-pg` for Postgres) — plain `new PrismaClient()` no longer works. The client + module live together in `src/libs/db.ts` (`Database` injectable + `@Global() DatabaseModule`), not split across a separate module/service file pair.
- **API docs:** Scalar at `/docs`, built from `@nestjs/swagger`'s `DocumentBuilder`/`SwaggerModule` in `src/libs/openapi.ts`.
- **OpenAPI operationId convention:** every `@ApiOperation` must set an explicit `operationId` (e.g. `operationId: 'messages'`, `operationId: 'createMessage'`). Without it, Nest defaults to `<Controller>_<method>` (e.g. `MessagesController_findAll`), which Orval turns into an ugly generated hook name (`useMessagesControllerFindAll`). An explicit id keeps the generated client readable (`useMessages`, `useCreateMessage`).

## React apps (`apps/www` and future frontend apps)

Route-level files (`*Page.tsx` / a router's `page.tsx` equivalent) only **wire up** a page: compose hooks and components, no logic of their own. Everything else follows a strict separation:

```text
src/
  components/   # presentational, one component per file
  hooks/        # all logic (data fetching, derived state, event handling) lives here
  constants/    # every literal that isn't inline JSX copy
```

- **Logic goes in hooks, not components.** A component reads props/hook return values and renders; it doesn't compute, transform, or branch on business rules itself.
- **One React component per file.** No multi-component files, no inline helper components defined inside another component's body.
- **Route/page files only wire things up** (Next.js `page.tsx` style) — import a hook, import components, compose them. If a page file has real logic in it, that logic belongs in a hook instead.
- **Components stay small: ~60–80 lines.** If a component grows past that, split it (extract a child component, or move logic to a hook).
- **No hardcoded literals in components.** Anything that isn't page copy — URLs, magic numbers, option lists, thresholds — goes in `constants/` (or `config/`) and gets imported.
- **Shared UI goes in `packages/ui`**, not duplicated per app. If a component is (or could be) used by more than one app, it belongs in the shared package, not in an app's own `components/`.
- **Frontend does not contain business logic.** It displays what the backend returns. If a screen needs data assembled from multiple sources, add a backend endpoint that returns the shape the frontend needs — don't stitch it together with client-side fetches/logic.
- **No `any`.** `@typescript-eslint/no-explicit-any` is enabled by the shared root ESLint config for all frontend code (it's only turned off for `apps/api`, where NestJS decorators occasionally require it).
- **No emojis in UI.** Never use emoji as icons, status indicators, or decoration in a component. Use an icon library (e.g. Phosphor, Heroicons, Lucide) instead — emoji are font-dependent, inconsistent across platforms/OSes, and can't be styled or sized via design tokens.
- **i18n from day one.** No hardcoded user-facing strings in components — route them through the app's translation layer (even a single-locale app), same as the "no hardcoded literals" rule above. Don't defer i18n to "later"; retrofitting it means touching every component again.

### Routing

Use a Next.js-style file-based router on top of `react-router`, built with `import.meta.glob` — not manually declared route objects. Reference implementation: [`docs/templates/router.tsx`](./templates/router.tsx) — copy it into the app (e.g. `src/router.tsx`) and point the glob base at that app's `pages/` directory.

Conventions the template expects from `src/pages/`:

- `pages/page.tsx` → `/`, `pages/about/page.tsx` → `/about`
- `pages/users/[id]/page.tsx` → `/users/:id` (dynamic segments via `[param]` folder names)
- `pages/(marketing)/page.tsx` → route groups: a `(group)` segment organizes files without appearing in the URL
- `pages/**/layout.tsx` → wraps every `page.tsx` beneath it; nested layouts compose outward-in
- `pages/**/{not-found,error}.tsx` → nearest-ancestor error boundary for that subtree; a top-level `pages/not-found.tsx` is the global catch-all
- Every page is lazy-loaded (`React Router`'s `lazy()`) — this is what "dynamic rendering" means here, not `dynamic()`/Next.js's own router, which this project doesn't use.

## Shared OpenAPI client (`packages/models`)

- `apps/api` is the source of truth. `scripts/export-openapi.ts` boots the Nest app and writes `packages/models/openapi.json`; Orval (`packages/models/orval.config.ts`) turns that into a TanStack Query client under `packages/models/src/generated/`.
- Both `openapi.json` and `src/generated/` are gitignored — regenerate with `task app:openapi:generate`.
- Orval's `schemas` output must **not** be named `models` (it collides with the package's own name, producing a confusing `models/src/generated/models` path) — it's `src/generated/schemas`.
- Consumers configure the base URL once via `setApiBaseUrl(url)` before rendering; `customFetch` throws if it's never called, instead of silently defaulting to `localhost`.

## MCP servers (`.mcp.json`)

| Server                 | Type           | Use for                                                                                                                                                                                                                                                       |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postgres-mcp-hatohui` | Docker (stdio) | Inspecting/querying the local workspace Postgres (`docker-compose.yml`, `localhost:5437`, db `hatohui`) directly — schema exploration, ad-hoc queries, EXPLAIN/performance analysis. Prefer this over `psql`/raw `docker exec` for anything beyond a one-off. |
| `doppler`              | `bunx` (stdio) | Reading/managing secrets if this workspace's env vars move to Doppler. Not currently wired into any app's `.env` flow — apps still use `.env.example` → `.env` (see Tooling above).                                                                           |
| `aws-knowledge`        | Remote HTTP    | Looking up current AWS service/API documentation. No auth, rate-limited. Use instead of guessing AWS behavior from training data.                                                                                                                             |
| `shadcn`               | `bunx` (stdio) | Pulling shadcn/ui component source when `packages/ui` (or an app) adopts shadcn. Not wired into any package yet.                                                                                                                                              |

Adding a new MCP server: register it in `.mcp.json`, then add a row here explaining what it's for and when to reach for it — an entry in `.mcp.json` with no explanation here is as good as undocumented.

## Taskfile

- `task setup` — installs deps, copies every app's `.env.example` → `.env`, generates the Prisma client. Safe to re-run.
- `task app:openapi:generate` — full chain: export spec from Nest, regenerate the Orval client.
- `task app:db:migrate` / `task app:db:generate` / `task app:db:studio` — Prisma workflows, always run with `apps/api` as `dir`.
