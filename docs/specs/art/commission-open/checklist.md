# Commission Opening — Checklist

Read [prd.md](./prd.md) in full first — it has the reasoning behind every
decision below, not just the outcome. This checklist is the resumable state:
what's done, what's broken right now, and the order to fix it in.

## Discovery — done

- [x] Problem statement and scope (`apps/art` + `apps/api`)
- [x] Use cases and user stories agreed (10 stories, PRD "User Stories")
- [x] Grounding: no new external deps (reuses `EmailService`, S3 path, auth)
- [x] Social auto-posting deferred
- [x] Progress timeline folded in

## Schema — done, frozen, migrated

- [x] `CommissionOpening` (per artist, scheduled/open/closed, 3 end modes)
- [x] `CommissionRequest` dropped — folded into `CommissionStatus`
      (`PENDING`/`ACCEPTED`/`DECLINED` ahead of the existing pipeline)
- [x] `Commission` / `CommissionDetail` split
- [x] `Client` model extracted from per-commission client fields
- [x] Multi-artist: `Commission.artistId` required, `assignedToId` folded in
- [x] `CommissionProgress` (+ `isFinal`, replaces `deliverableAssets`)
- [x] `CommissionNote` → `Comment`: attaches to project / group / commission /
      progress via nullable FKs, `authorClientId` identifies which client
- [x] Enums renamed to `Visibility` / `AuthorRole` (no longer commission-only)
- [x] Anonymous access: access key is the credential, no client login
- [x] `PaymentMethod` global catalog + per-artist selection in `UserSetting`
- [x] `CommissionGroup` + `CommissionGroupMember` (shared price, full
      in-group visibility incl. money), `CommissionGroup.projectId` links a
      group back to the project brief it formed around
- [x] `Project` is the originating brief (`brief`, `artistId`, `groups`) *and*
      collects final artworks (`CommissionProgress.projectId`);
      `Project.isHidden` defaults to `true`
- [x] `CommissionStatusHistory` kept; client timeline is a merged read of it
      + `CommissionProgress`, not one table
- [x] `currency` / `quote` / `originalQuote` (was `quoteCents`, USD-only) —
      and generally, every money field is a plain integer with no `Cents`
      suffix (`basePrice`, `minPrice`, `feeAmount`); the unit is always the
      smallest unit of whatever `currency` says
- [x] `isHidden` → `isHiddenInQueue` (`Commission` only; `Project` untouched)
- [x] Roles as tables (`Role` + `UserRole` join, not an enum) — replaces the
      previously-dropped role system
- [x] Per-artist `CommissionType` (pricing merged in) / `CommissionOption` /
      `CommissionAddon`; rush fee + currency default moved to `UserSetting`
- [x] `CommissionAddon.priceMode` (`FIXED`/`STARTING_FROM`/`RANGE`) +
      `maxPrice` — an addon can now be a fixed price, a floor ("from X"), or a
      genuine range, not just always-a-floor
- [x] `prisma validate` + `prisma format` pass
- [x] `task db:generate` — client regenerated
- [x] **Migrated — local dev AND production, both confirmed applied and
      verified.** `20260827033240_commission_status_add_intake_values` →
      `20260827033249_commission_opening_client_roles` →
      `20260827033300_seed_roles_and_backfill_users` →
      `20260827040008_commission_addon_price_mode`. Migration 2 failed
      against production on the first real deploy attempt and had to be
      rewritten to be fully idempotent (safe to re-run against any partial
      state) after a live incident — **read PRD "The production incident"
      in full before touching this migration file again**, it is not
      optional context. Post-deploy verification against production
      confirmed every value correct: all 4 `CommissionType` rows, both
      options, both addons, the rush-fee setting, all 32 users intact, the
      admin correctly holding `user`+`admin`+`artist`, old tables gone.

**Do not edit `schema.prisma` again without adding a new migration.** The
four above are applied to both local dev and production; don't hand-edit
their `.sql` files without re-reading the incident writeup first — migration
2 specifically must stay idempotent (guards intact) since it's now proven to
matter, not theoretical. When generating a migration that both adds enum
values *and* uses them (`prisma migrate diff --script` puts both in one
file), split the `ALTER TYPE ... ADD VALUE` statements into their own earlier
migration — Postgres cannot use a new enum value in the same transaction that
adds it.

## Code cascade — backend done, frontend not started

### Backend — done, `apps/api` typechecks clean, lints clean, seeds clean

1. [x] **Seeds rewritten.** `prisma/seeds/core/roles.ts` seeds the 3 `Role`
       rows and `grantBaselineRoles` (the ongoing counterpart to the backfill
       migration — re-running `db:seed` stays correct, doesn't depend on that
       migration forever). Old `core/commission-pricing.ts` deleted; replaced
       by `development/commission-pricing.ts`, which creates a dev artist
       (`artist@example.dev`), grants it the `artist` role, and seeds
       per-artist `CommissionType`/`CommissionOption`/`CommissionAddon` plus
       `UserSetting` currency + rush fee.

       Note for next time: every upsert here uses `update: {}` deliberately —
       re-running `db:seed` in production must never clobber an artist's real,
       already-edited catalog. The cost is that a schema fix (like adding
       `priceMode`) doesn't retroactively apply to an already-seeded row; fix
       those by hand locally rather than changing this to always-overwrite.
2. [x] **`AuthService.isAdmin`** now checks "holds the `admin` role" via a
       cached `rolesFor(userId)` lookup (`CACHE_KEYS.userRoles`), not the old
       email match. Added `isArtist`/`hasRole` alongside it, and `isArtist` on
       `UserDto`/`toUserDto` for future frontend gating. Role keys live in
       `ROLE_KEYS` (`src/modules/auth/auth.constants.ts`) — seed files don't
       import from `src/`, so `roles.ts` duplicates the literal keys with a
       comment pointing at the source of truth; keep them in sync by hand.
3. [x] **`commission-types` module** — per-artist now (`artistId`,
       `@@unique([artistId, key])`), `label`/`basePrice` merged in, `tagId`
       nullable and shared across artists (`Tag.name` upsert, not `.create`,
       so two artists both offering "Icon" don't collide). Public `list`
       takes a required `artistId` query param; mutations resolve the artist
       from `@CurrentUser()` and are gated by `AuthService.isArtist` +
       ownership-scoped (`findUnique` + `artistId` match, else 404).
4. [x] **`commission-pricing` module** — `CommissionTypePricing` is gone
       (folded into `commission-types`, so this module no longer touches
       types at all). `CommissionOptionPricing`/`CommissionAddonPricing` →
       per-artist `CommissionOption`/`CommissionAddon`, same ownership
       pattern as above, now with `priceMode`/`maxPrice` on addons
       (`normalizeAddonMaxPrice` enforces `maxPrice > minPrice` when `RANGE`,
       forces `null` otherwise). Rush fee moved to a `UserSetting` JSON blob
       (`{thresholdDays, feeAmount}`) via `USER_SETTING_TYPES.commissionRushFee`
       / `commissionCurrency`. Public `GET /commission-pricing` takes a
       required `artistId` query param and returns
       `{options, addons, rushFee, currency}` — no `types` anymore, fetch
       those from `commission-types` directly.
5. [x] **`projects` module** — `Project.commissions` → `Project.artworks`
       (`CommissionProgress[]`, filtered to `isFinal: true`). `ProjectDto`
       renamed `commissionCount`→`artworkCount`,
       `deliverableAssets`→`artworkImages`, `coverAssetUrl`→`coverImageUrl`;
       added `artistId`/`brief`. `create`/`update`/`updateVisibility`/`remove`
       are artist-owned + `isArtist`-gated; public `list` gained an optional
       `artistId` filter. Fixed an unrelated pre-existing DTO bug on the way:
       `@ApiProperty({ type: 'object', required: false })` narrows to the raw
       OpenAPI `SchemaObject` type, where `required` means "list of required
       property names" (`string[]`), not "optional" (`boolean`) — same reason
       the existing `idea` field never sets `required` at all.
6. [x] **`commissions` module — the big one.** `CommissionDto`/`CommissionPublicDto`
       rebuilt flat across `Commission` + `CommissionDetail` + `Client` (kept
       flat rather than nested, to limit frontend churn). `assign()` and
       `updateProject()`/`AssignCommissionDto`/`UpdateCommissionProjectDto`
       are **deleted, not adapted** — `assignedToId` and `Commission.projectId`
       no longer exist on the model at all (folded into `artistId`; project
       attachment now happens on a `CommissionProgress`, not a `Commission`).
       `commission-note.dto.ts` renamed to `comment.dto.ts`
       (`CommentDto`/`CreateCommentDto`), matching the model rename.

       **The load-bearing open item is resolved, not deferred:**
       `SubmitCommissionDto` now requires `artistId` (+ optional
       `commissionOpeningId`), so public submission is genuinely artist-scoped
       instead of assuming a single site owner. `resolveClient()`
       upsert-by-email creates or reuses a `Client` row (this is also the
       prefill mechanism the PRD describes for Use Case 6, though no lookup
       endpoint exposes it yet — see item 7). New commissions default to
       `PENDING` through this path.

       **Private commissions (Use Case 7) got a real endpoint:**
       `POST /commissions/private` (`AuthGuard` + `isArtist`) →
       `createPrivate()`, which creates directly at `NOT_YET_STARTED` — no
       triage, no opening, unaffected by whether an opening is open, closed,
       or never existed, per the PRD's intake-paths table.

       `deliver()` now creates a `CommissionProgress{isFinal: true}` row (via
       direct `this.db.commissionProgress.create` — no dedicated progress
       module exists yet, see item 7) instead of writing to a
       `deliverableAssets` field that no longer exists, and sets
       `CommissionDetail.deliveredAt` in the same transaction.

       Commission-notification email switched twice this session: first from
       a single global `SystemParameters` value (wrong — one email for every
       artist) to `artist.email` directly, then to
       `USER_SETTING_TYPES.commissionNotificationEmail` with `artist.email` as
       the fallback — per-artist and overridable, not hardcoded either way.
       The dead `COMMISSION_RECEIVED_NOTIFICATION_CONFIG_TYPE` constant and
       its `SystemParameters` seed row were removed from
       `commissions.constants.ts` and `seeds/core/system-parameters.ts`.
7. [x] `task db:seed` succeeds. `bunx tsc --noEmit` clean. `bunx eslint` clean
       on every file touched this session.

**Ownership pattern used throughout, reuse it for what's left:** resolve the
artist from `@CurrentUser()`, gate mutations with `AuthService.isArtist`,
scope every read/write by `artistId`, and let a `findUnique` + ownership
mismatch fall through to 404 rather than 403 (don't reveal another artist's
row exists).

### Still not built — new modules (backend)

None of these exist yet as their own module/controller. `docs/conventions.md`'s
one-module-per-resource rule applies — this is several resources, not one
`commission-open` module:

- [ ] **`commission-openings`** — CRUD + open/close for `CommissionOpening`.
      Enforcing "one active opening per artist" is a service-layer check;
      Prisma's schema DSL can't express the partial unique index.
- [ ] **`commission-progress`** — the timeline itself (list/create/mark-final),
      currently only reachable indirectly via `deliver()`'s inline write.
- [ ] **`clients`** — an explicit lookup-by-email endpoint for the prefill flow
      (Use Case 6/8). `resolveClient()` exists inside `commissions.service.ts`
      but there's no way for the frontend to query "have I commissioned
      before?" ahead of submitting.
- [ ] **`commission-followers`** — subscribe/unsubscribe by email, per artist.
- [ ] **`commission-groups`** — group CRUD, membership, the shared
      visibility/comment rules from the PRD's "Groups and projects" section.
- [ ] **`comments`** on `project`/`group` subjects — `Comment` supports all
      four subject FKs in the schema, but only the `commission`/`progress`
      paths have service methods so far (inside `commissions.service.ts`).

### Frontend

8. [x] `task app:openapi:generate` — regenerated and committed
       (`packages/models/openapi.json` + `src/generated/`).
9. [x] **Re-ran the frontend typecheck after regenerating.** ~50 pre-existing
       errors surfaced as predicted. The pricing-settings slice of that
       cascade is now fixed (item 10); the rest is not — see "Still broken"
       below.
10. [x] **`/app` internal app area + Commission Settings — built and
        verified in the browser (logged-out state + `/app` redirect; full
        logged-in walkthrough confirmed by the user directly).**
    - `packages/ui`: new generic `Sidebar`/`SidebarHeader`/`SidebarContent`/
      `SidebarFooter`/`SidebarToggle`/`SidebarNavItem` (collapsible, context-
      based, framework-agnostic — `SidebarNavItem` takes an `as` prop so
      `apps/art` passes Next's `Link` for client-side nav instead of a plain
      `<a>` forcing full reloads).
    - `apps/art/src/app/app/layout.tsx`: gated on **logged in** (any user),
      not `isArtist` — matches "the app button ... only available if you're
      logged in." Renders `AppSidebar` + content.
    - `apps/art/src/app/app/page.tsx`: dashboard placeholder.
    - `apps/art/src/app/app/commission-settings/page.tsx`: gated on
      **`isArtist`** specifically (redirects to `/app` otherwise) — the one
      part of `/app` that's artist-only, per the request.
    - `AppSidebar.tsx`: nav shows Dashboard always, "Commission settings"
      only when `user.isArtist`.
    - `SiteHeader.tsx`: app-grid icon button next to the avatar, rendered
      only inside the existing `{user && (...)}` block (logged-in gate was
      already there for the avatar; extended, not duplicated).
    - **Reused rather than duplicated:** `/admin/pricing` did this exact job
      already (broken by the schema cascade). Fixed its hooks/components
      once — `useCommissionTypesAdmin`, `useCommissionPricingAdmin`,
      `useCommissionRushFeeAdmin`, `CommissionTypeSection`,
      `CommissionOptionPricingSection`, `CommissionAddonPricingSection`,
      `CommissionRushFeeSection` — and both `/admin/pricing` and the new
      `/app/commission-settings` now render the same
      `CommissionSettings.tsx` composition. Deleted
      `CommissionTypePricingSection`/`CommissionTypePriceRow` entirely
      (the old two-step "type + separate pricing row" UI is redundant now
      that `CommissionType` carries `label`/`basePrice` directly) and the
      now-orphaned `PricingPageTitle`.
    - `CommissionAddonPricingSection` gained the `priceMode` (Fixed/Starting
      from/Range) picker + conditional max-price input, wired to the schema
      change from earlier in this session.
    - Fixed a real lint error surfaced along the way, not just a style nit:
      `CommissionRushFeeSection` was syncing fetched data into local state
      via `useEffect` + `setState` (flagged by `react-hooks/set-state-in-effect`
      — cascading-render risk). Replaced with the key-remount pattern: an
      inner `RushFeeForm` keyed on `rushFee ? 'loaded' : 'default'`
      initializes its `useState` directly from the loaded value, no effect.
    - i18n: new `app.*` keys added to **all three locales** (en/ja/vi), not
      just en — `app.nav.*`, `app.commissionSettings.*`, `app.dashboard.*`,
      plus `commission.admin.pricing.priceMode.*`.
    - Orphaned a leftover Windows dev-server process while verifying
      (`preview_stop` doesn't always fully kill on Windows) — found and
      killed the PID holding port 5175 directly rather than guessing.
11. [x] **Fixed — the whole cascade, plus real per-artist routing.** The
        user chose "real per-artist routing now" over hardcoding a single
        site-owner artist (the cheaper option) when asked directly, so this
        went further than patching the ~40 tsc errors:
        - **Routing**: every public route moved under a new `/[artist]`
          segment, keyed by the artist's public **handle**
          (`Profile.handle`, already existed platform-wide — not a new
          field): `/[artist]` (gallery, was `/`), `/[artist]/commission`,
          `/[artist]/queue`, `/[artist]/queue/[code]`,
          `/[artist]/projects/[id]`. `/[artist]/layout.tsx` resolves the
          handle via a new `resolveArtist()` (`src/lib/artist.ts`, wrapped in
          React's `cache()` so the layout and page under it share one API
          call) and 404s on an unknown/non-artist handle. The new root `/` is
          `ArtistPicker.tsx` — lists every artist with a handle, links to
          `/[handle]`. `SiteHeader`'s nav links itself off `useParams()` now,
          not hardcoded paths.
        - **New backend `artists` module**: `GET /artists` (list, handle
          required) and `GET /artists/:handle` (resolve one, 404 if the
          handle doesn't belong to an artist) — reuses `PublicUserDto`/
          `PUBLIC_USER_SELECT` from the `users` module rather than
          duplicating the "safe public shape" concept. Added
          `AuthService.isArtistById` alongside the existing `isArtist(User)`
          since this module often only has an id, not a full row.
        - **New public `GET /commission-types/by-artist/:artistId`** — the
          storefront needs "this artist's enabled types" without being that
          artist (unlike `/commission-types/mine`, which is
          `@CurrentUser()`-only).
        - **Two real multi-artist bugs caught and fixed along the way**,
          neither hypothetical: `AssetsService.create`/`update`/`remove` were
          gated on global `isAdmin` — under one assumed site-owner that
          happened to work, but it meant *no artist who isn't also the
          platform admin could upload to their own gallery at all*. Now
          gated on `isArtist` (create) / ownership-or-admin (update, remove).
          Same shape of bug in `ProjectsService.list`/`findOne`: hidden
          projects were only visible to a global admin, not to the artist
          who owns them. Both fixed with an `isOwner` check alongside the
          existing `isAdmin` one. `assets`/`useGalleryAssets` also gained a
          `uploadedById` filter so a storefront's gallery only shows that
          artist's uploads.
        - **Every file from the original broken-cascade list fixed**:
          `CommissionForm`/`CommissionTypeFields`/`CommissionQuoteEstimate`/
          `useCommissionForm` (`artistId` param, submits it in
          `SubmitCommissionDto`), `useCommissionPricingEstimate` (fully
          rewritten — see below), `CommissionQuoteEditor`/
          `CommissionAdminNotes`/`CommissionDetailAdmin`/
          `useCommissionDetail` (`CommissionNoteDto`→`CommentDto`,
          `quoteCents`→`quote`, `deliverableAssets`→`images`/`deliveredAt`,
          dropped `setProject` — `updateCommissionProject` no longer exists,
          project attachment moved to `CommissionProgress`),
          `OrderDetail`/`OrderNotesThread` (same DTO renames, public side),
          `ProjectDetail`/`ProjectCard`/`ProjectsAdminList`/
          `ProjectCreateForm`/`useProjects` (`coverAssetUrl`→`coverImageUrl`,
          `deliverableAssets`→`artworkImages`, `commissionCount`→
          `artworkCount`, `CreateProjectDto.brief` now required,
          `ProjectsParams` fixed from a bugged `{query:{...}}` call to
          `(params, options)`), `useCommissionQueue` (`artistId` param).
          `CommissionProjectSelect.tsx` and the orphaned, never-wired
          `ProjectsGrid.tsx` deleted rather than patched — both dead once
          the model changed.
        - **`useCommissionPricingEstimate` rewritten** for the type-catalog
          rework's pricing model, not just renamed fields: fetches
          `commissionTypesByArtist` + `commissionPricing({artistId})`,
          groups options by `commissionTypeId`, resolves the sole option
          automatically when a type has exactly one (`CommissionTypeFields`
          only renders the option dropdown when there are 2+), computes
          `PERCENTAGE` addons against the selected option's price per the
          PRD, and reads `rushFee.enabled` instead of treating any stored
          rush-fee row as implicitly on.
        - **A real hydration bug, introduced and caught in this same
          pass**: fixing `useCommissionForm`'s draft-restore
          `set-state-in-effect` lint warning by switching to a `useState`
          lazy initializer reading `localStorage` broke SSR — `localStorage`
          doesn't exist on the server, so the server-rendered HTML and the
          client's first paint disagreed and hydration failed. Caught by
          checking browser console after the routing work, not by lint or
          `tsc` (neither would have flagned it). Reverted to the effect-based
          restore with a comment explaining why the effect is correct here
          (syncing from a system unavailable at render time is what effects
          are for, despite the lint heuristic) rather than fighting the lint
          rule again.
        - **Verified two ways**: `bunx tsc --noEmit` and `bunx eslint --fix`
          clean across `apps/api`, `apps/art`, `packages/ui`,
          `packages/models` (only remaining lint error is
          `ImagePreviewGrid.tsx`'s pre-existing, untouched
          `set-state-in-effect` — confirmed via `git diff` that this session
          never touched that file). Live in the browser: artist picker →
          `/dev-artist` gallery (empty-state correct) →
          `/dev-artist/commission` → selected "Bust" (2 options) and got the
          option dropdown, selected "Icon" (1 option) and got no dropdown
          plus a correct live `$30.00` estimate → `/dev-artist/queue`. Console
          checked for errors after every navigation (a fresh tab, not just
          reload, to rule out stale HMR state).
        - Dev seed (`development/commission-pricing.ts`) now also upserts a
          `Profile{handle: 'dev-artist'}` for the seeded dev artist — without
          it, the dev artist has no way to be reached at `/[artist]` at all,
          since a real `Profile`/handle is otherwise only created through
          onboarding opt-in.
12. [x] **Commission types: create/edit UI, using the workspace's editable
        table pattern.** `CommissionTypesTable.tsx` — `@hatohui/ui`'s
        `EditableDataTable` (the same component `apps/workspace`'s
        `SystemParametersTable`/`ProfilesTable`/`UsersTable` use), not a new
        ad-hoc form. Click-to-edit cells, resizable + `localStorage`-persisted
        columns, inline "+ Add commission type" draft row — mirrors
        `SystemParametersTable`'s draft-row pattern exactly (`key` locked
        once created, same as that table's `type` column).

        Base price displays/edits as a **decimal dollar string** (`3.50`),
        never a raw minor-unit integer — the row-mapping layer
        (`toRow`/`toCents`) converts at the boundary; the table and the API
        never see anything but cents. `active` is a select
        (Active/Inactive) rather than a hard delete, consistent with how
        `ProfilesTable`/`SystemParametersTable` don't offer row deletion
        either — deactivating fits an editable-table UI better than deleting.

        Replaces the old `CommissionTypeSection.tsx` (ad-hoc list + separate
        create form) entirely — deleted, not kept alongside.

        Caught a real bug while wiring this in, unrelated to the table
        itself: `CommissionRushFeeSection`'s `RushFeeForm.initial` was typed
        `RushFeeSetting | undefined`, but the API returns
        `CommissionRushFeeSettingDto | null` — `tsc -b` caught the mismatch
        immediately once this file touched that code path again.

        **Not independently browser-verified this round** — the user has
        their own logged-in dev session running and is testing directly.
13. [ ] Build the remaining new UI per the PRD's use cases (opening config,
        triage card/table views, accepted-slots table, progress timeline,
        group views, anonymous-client access-code flow).
14. [x] Lint + typecheck everything touched by item 11's cascade fix —
        `apps/api`/`apps/art`/`packages/ui`/`packages/models` all clean.
        Item 13 hasn't happened yet, so this isn't "everything" for the
        feature as a whole yet, just everything touched so far.

## Commission type catalog rework — done, local only, NOT deployed to production

Reworked per the user's explicit design feedback after the production
incident above was resolved. See PRD "Commission type catalog: from
per-artist table back to a global catalog" for the full rationale.

- [x] Schema: `CommissionType` → global catalog (`key` unique, no price);
      new `ArtistCommissionType` join (enable/disable + order); `CommissionOption`
      scoped to `(artistId, commissionTypeId)` with its own `priceMode`/price
      (`modifierPercent` removed); `PriceMode.PERCENTAGE` added, valid only on
      `CommissionAddon` (new nullable `percent` column, `minPrice`/`maxPrice`
      now nullable); rush-fee `UserSetting` JSON gained `enabled: boolean`.
- [x] Migration `20260827152523_commission_type_catalog_rework` — applied and
      verified against local dev only. **Not rehearsed or applied against
      production.** Unlike the CommissionType rows (map 1:1 by key, safe to
      drop `artistId`/`basePrice`), the old flat `CommissionOption` rows have
      no relation to any type to backfill from — deploying this needs an
      explicit decision with the artist about which type(s) their 2 existing
      options belong under before it can be rehearsed and applied for real,
      the same rehearse-locally-first discipline as the last incident.
- [x] Seeds: new `core/commission-types.ts` seeds the global catalog
      (SKETCH/LINEART/ICON/BUST/FULL/SKETCHPAGE/COMIC/ANIMATION);
      `development/commission-pricing.ts` rewritten to enable a subset for
      the dev artist and create type-scoped options.
- [x] Backend: `commission-types` module rewritten — `GET /commission-types`
      is now the public global catalog, `GET /commission-types/mine` is the
      artist-joined enablement view, `PUT /commission-types/:id/enable` is
      the artist toggle, create/update/delete of catalog entries now require
      `isAdmin` (was `isArtist`). `commission-pricing` module: options now
      take `commissionTypeId`; addon DTOs/service handle `PERCENTAGE` +
      `percent`; rush-fee DTOs carry `enabled`.
- [x] Frontend: `CommissionTypesTable.tsx` is now an enable/disable toggle
      list (new `Switch` component added to `@hatohui/ui`) that renders a new
      `CommissionOptionsTable.tsx` (EditableDataTable, wired with
      `onDeleteRow` — this is also where "i can't delete the rows for the
      table as well" got fixed) per enabled type.
      `CommissionOptionPricingSection.tsx` deleted (options aren't a flat
      per-artist list anymore). `CommissionAddonPricingSection.tsx` rewritten
      from an ad-hoc form to the same EditableDataTable pattern, with
      `PERCENTAGE` mode + percent column. `CommissionRushFeeSection.tsx` got
      an enabled `Switch`.
- [x] Verified via `tsc --noEmit` (api, art, ui all clean — new files
      introduce zero errors; the ~40 pre-existing errors in
      `CommissionQuoteEditor.tsx`/`useCommissionPricingEstimate.ts`/etc. are
      the already-flagged separate-scope cascade from item 11, untouched) and
      via curl against a minted dev-artist session cookie exercising every
      new endpoint (catalog list, mine, enable toggle, option create incl.
      RANGE-without-maxPrice 400, addon create incl. PERCENTAGE-without-percent
      400, rush-fee update) — all behaved as designed. Could not verify the
      new UI in-browser: the browser tool's permission classifier blocked
      injecting a session cookie to simulate a logged-in artist, and there is
      no dev OAuth bypass in this codebase to log in for real.
- [ ] Log in as a real artist in the browser and click through the new
      Commission Settings page at least once (toggle a type, add/edit/delete
      an option, add a PERCENTAGE addon, flip the rush-fee switch).
- [ ] Decide with the artist how to re-create their 2 existing production
      `CommissionOption` rows under the new per-type shape, then rehearse and
      deploy the migration to production (same discipline as the last one:
      rehearse against a production-shaped local copy first, verify by direct
      query after, never trust migration-table bookkeeping alone).
- [ ] `useCommissionPricingEstimate.ts` (public commission-request price
      estimate) still references the old flat option/addon shape
      (`modifierPercent`, `minPriceCents`, `pricing.types`) — it's part of the
      already-flagged item-11 cascade, but now also needs the new "derive
      price from selected option, render a dropdown only when a type has >1
      enabled option" logic from the PRD once that cascade gets picked up.

## Later / separate (do not fold into this feature)

- [ ] Rename this spec folder to `commission-opening/` to match the model name
- [ ] Collaboration (`CommissionCollaborator`), which restores a real author
      on progress entries and comments once >1 person works a commission
