# @friends v2 — Directory Views, Self-Service Onboarding & RBAC

## Idea

The v1 MVP (see `../PRD.md`) shipped a single-owner birthday tracker. This round
extends it into a shared, multi-user friend directory: richer ways to browse and
search the list, a self-service Google-login onboarding flow so other people can
join and add themselves, and a role/ownership model so mutations stay scoped
correctly (admin sees and edits everything, members edit only what they added,
everyone else is read-only).

## Scope

- **Frontend:** `apps/friends` only. RBAC and backend-driven i18n were both raised
  as ideas that should eventually be standard across all apps, but per-app
  scaffolding for those is explicitly deferred to their own future
  `/feature-discovery` sessions — this doc only covers what `apps/friends` needs to
  function, even though some of the underlying auth/session code already lives in
  `packages/libs` and `apps/api`'s `auth` module.
- **Backend:** reuses `apps/api`'s existing `auth` module (Google ID-token exchange,
  JWT session cookie — already implemented, currently unused by any route) and the
  `friends` module. No new backend app, no new external services.
- **Out of scope for this discovery doc:** exact Prisma field types/migration
  names, exact component breakdown, exact API contracts — those belong to the
  implementation spec. Also explicitly out of scope: backend-driven i18n content
  editing, full multi-app RBAC package design, and a future "Tinyfish" integration
  to auto-discover a user's connections (noted below as a forward-looking idea,
  not something this pass builds).

## Key architecture decisions

- **No new external APIs.** Google OAuth reuses the existing `GOOGLE_OAUTH_CLIENT_ID`
  and the existing `apps/api` `auth` module/session cookie. No calendar library is
  added — calendar/timeline views and date grouping build on the custom formatters
  already in `packages/tools` (this repo deliberately dropped `date-fns`).
- **Roles are a flat enum, not a permission matrix.** "RBAC" here means a `Role`
  enum (`ADMIN` / `MEMBER`) on `User`, not a many-to-many roles↔permissions schema —
  there are exactly two authenticated tiers plus anonymous, so a join-table model
  would be premature.
- **Admin identity is data-driven.** A singleton `AppConfig` table holds the admin
  email (seeded with `hatohui@gmail.com`) instead of hardcoding it in source, so it
  can change without a code deploy.
- **Ownership-scoped mutation.** `Friend` gains an `ownerId` (the `User` who added
  it). Admin bypasses ownership checks entirely; a member can only mutate rows they
  own; unauthenticated requests are read-only.
- **Visibility is per-friend-entry, set once during onboarding.** `Friend` gains a
  `visibility` enum (`PUBLIC` / `FRIENDS_ONLY` / `NONE`). Selecting `NONE` during
  onboarding skips the birthday-entry step entirely (nothing to show, so nothing to
  ask).
- **Onboarding writes progress directly to the row being created, not a separate
  draft/session table.** Each wizard step calls a real mutation against the
  in-progress `Friend`/connection records rather than caching unsaved state
  client-side — this is what makes "refresh mid-wizard, come back where you left
  off" work without inventing a new persistence layer.
- **Declining onboarding is permanent and silent.** No re-prompt logic, no
  "reminder" flow. The only way back in is the user manually using an "add myself"
  entry point inside the normal add-friend form.
- **Connections are many-to-many, modeled now for a "friendship map" later.** The
  onboarding multi-select ("people you know already in the system") creates rows in
  a join table between the new user and existing `Friend` entries. No graph
  visualization is built in this pass — the schema just needs to support one being
  built later without a migration.
- **Forward-looking, not built now:** a future integration (referred to as
  "Tinyfish") to auto-fetch a user's real-world connections and pre-populate the
  onboarding multi-select. Flagged here so the connections join-table design
  doesn't accidentally preclude it, but no code/env vars for it are part of this
  pass.

## User stories

### US1 — Browsing & Finding Friends

As any visitor (logged in or not), I want to switch between a calendar view and the
existing chronological timeline view, and search/sort/filter/group the list, so
I can quickly find whoever I'm looking for regardless of how I think about dates.

- **AC1 (View toggle):** Given I'm on the directory, when I switch between
  "Calendar" and "Timeline," then the same underlying friend data re-renders in
  that layout without a full page reload.
- **AC2 (Search):** Given I type into the search field, when the query matches a
  friend's name, a social handle, or a date, then the visible list narrows to
  matches only (debounced, not firing on every keystroke).
- **AC3 (Sort/filter/group):** Given I'm on the directory, when I choose a sort
  (e.g. name, upcoming date), a filter, or a group-by (age, month, year), then the
  list re-renders accordingly.
- **AC4 (Visibility-aware):** Given a friend entry's visibility is `NONE` or
  `FRIENDS_ONLY` and I'm not authorized to see it, then it does not appear in my
  results at all.

### US2 — Self-Service Onboarding Wizard

As a first-time Google-authenticated user, I want a short guided flow to decide
whether and how I appear in the directory, so joining feels like my choice, not a
form I stumbled into.

- **AC1 (Trigger):** Given I log in via Google for the first time, then the
  onboarding wizard opens automatically instead of dropping me on the dashboard.
- **AC2 (Opt-in):** Step 1 asks "Do you want to be part of the list?" (Yes/No) with
  a note: "You can choose who can see your birthday."
- **AC3 (Visibility):** If Yes, step 2 asks for visibility mode: Public / Friends
  only / None.
- **AC4 (Conditional birthday):** If visibility is Public or Friends only, step 3
  asks to confirm a Google-sourced birthday (if available) or enter one manually.
  If visibility is None, this step is skipped.
- **AC5 (Connections):** Step 4 shows a debounced, paginated search over existing
  people in the system with multi-select, to record who the new user already
  knows.
- **AC6 (Resumable):** Given I close the browser or refresh mid-wizard, when I
  return, then I resume from the step I left off, without re-entering earlier
  answers.
- **AC7 (Skippable):** Given I'm anywhere in the wizard, when I press "Skip," then
  I'm taken into the app with no friend record created for me, and I'm never
  auto-prompted with this wizard again.

### US3 — Adding Yourself Later

As a user who skipped onboarding, I want a manual way to add myself to the
directory later, so declining once doesn't lock me out permanently.

- **AC1 (Manual entry point):** Given I previously skipped onboarding, when I open
  the normal "Add Friend" form, then an option is available to add myself as the
  subject (as opposed to adding someone else).

### US4 — Role-Based Mutation Access

As the system, I want to enforce who can create/edit/delete friend entries based on
role and ownership, so the directory can't be tampered with by the wrong people.

- **AC1 (Admin):** Given my account's email matches `AppConfig.adminEmail`, then I
  can view, create, edit, and delete any friend entry.
- **AC2 (Member):** Given I'm authenticated and not admin, then I can create new
  friend entries and edit/delete only entries where `ownerId` is me.
- **AC3 (Anonymous):** Given I'm not authenticated, then all mutation endpoints
  reject my request, and the UI only offers read access.
- **AC4 (Guard reuse):** The existing `AuthGuard`/session-cookie mechanism in
  `apps/api`'s `auth` module is reused for all of the above — no second auth
  system.

### US5 — Friendship Connections

As the system, I want to record which existing people a new member already knows,
so a friendship graph can be visualized in a future iteration.

- **AC1 (Many-to-many):** A connection between a `User` and a `Friend` entry they
  selected during onboarding is persisted in a join table, not inferred at read
  time.
- **AC2 (No graph UI yet):** This pass persists the data only; no visualization is
  built now.

## External integrations & env vars to prepare

- **Google OAuth (login):** already fully wired (`GOOGLE_OAUTH_CLIENT_ID`,
  `SESSION_JWT_SECRET`, `apps/api`'s `auth` module) — no new vars.
- **No other new external integrations.** The future "Tinyfish" connections-import
  idea is noted for awareness only; it is not scheduled, has no env vars reserved,
  and should get its own discovery pass when it's actually being built.
