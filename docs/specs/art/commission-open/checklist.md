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
- [x] Migrated locally, in order:
      `20260827033240_commission_status_add_intake_values` →
      `20260827033249_commission_opening_client_roles` →
      `20260827033300_seed_roles_and_backfill_users` →
      `20260827040008_commission_addon_price_mode`
- [x] Backfill migration (3rd above) verified safe for production users
      (simulated admin-email-match + plain user in a transaction, rolled
      back) — see PRD "Migrations" for exactly what it does and why

**Do not edit `schema.prisma` again without adding a new migration.** The
four above are applied to local dev; don't hand-edit their `.sql` files.
When generating a migration that both adds enum values *and* uses them
(`prisma migrate diff --script` puts both in one file), split the
`ALTER TYPE ... ADD VALUE` statements into their own earlier migration —
Postgres cannot use a new enum value in the same transaction that adds it.

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
11. [ ] **Still broken — pre-existing cascade, not touched:**
        `CommissionForm.tsx`, `CommissionQuoteEditor.tsx`, `KanbanBoard.tsx`,
        `CommissionAdminNotes.tsx`, `CommissionReferenceExamples.tsx`,
        `CommissionDetailAdmin.tsx`, `useCommissionDetail.ts`,
        `useCommissionPricingEstimate.ts`, `OrderDetail.tsx`,
        `OrderNotesThread.tsx`, `ProjectDetail.tsx`, `ProjectCard.tsx`,
        `ProjectsAdminList.tsx`, `ProjectCreateForm.tsx`, `useProjects.ts`,
        `useCommissionQueue.ts`, `useCommissionForm.ts`,
        `CommissionTypeFields.tsx`, `CommissionQuoteEstimate.tsx`. Every one
        of these public-facing API calls also needs an `artistId` added now
        that the backend requires one — resolving *which* artist a given
        `apps/art` page is for is itself unbuilt (no per-artist routing yet
        on a site that used to assume a single owner). This is the next
        chunk of work, separate from what item 10 covered.
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
14. [ ] Lint + typecheck everything touched, once 11 and 13 are done.

## Later / separate (do not fold into this feature)

- [ ] Rename this spec folder to `commission-opening/` to match the model name
- [ ] Collaboration (`CommissionCollaborator`), which restores a real author
      on progress entries and comments once >1 person works a commission
