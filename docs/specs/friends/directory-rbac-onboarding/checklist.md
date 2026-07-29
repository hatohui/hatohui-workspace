# @friends v2 — Discovery Checklist

Decisions confirmed during discovery. This is not a prioritization/MVP cut list —
see `PRD.md` for the full user stories. Use this as the starting checklist for the
implementation spec.

## Scope & architecture

- [x] Scoped to `apps/friends` only. RBAC-as-a-platform-standard and backend-driven
      i18n are deferred to their own future discovery sessions.
- [x] No new external APIs — reuses existing `apps/api` `auth` module (Google
      ID-token exchange + JWT session cookie) and existing `packages/libs/src/auth`
      frontend pieces (now wired into `apps/friends`).
- [x] No new calendar/date library — the calendar view is a 12-month grid built on
      `packages/tools` formatters, not a day-grid calendar widget.
- [x] Roles are a flat `Role` enum (`ADMIN` / `MEMBER`) on `User`.
- [x] Admin identity comes from a singleton `AppConfig` table (`adminEmail`, seeded
      `hatohui@gmail.com` via `apps/api/prisma/seeds/core/app-config.ts`), assigned
      to `User.role` on every Google login.
- [x] **Identity model ended up as three entities, not two** (this changed mid-way
      through discovery from the original `Friend.ownerId`/`Friend.selfOfUserId`
      design): `User` (the login account), `BirthdayDetails` (a birthday/profile
      entry — replaces the old `Friend` model name), and `Association`
      (one-to-one, permanent link between a `User` and the `BirthdayDetails` entry
      that represents them). Most `BirthdayDetails` rows are never associated —
      they're entries someone added about a third party.
- [x] Ownership-scoped mutation via `BirthdayDetails.addedById`; admin bypasses,
      member restricted to entries they added, anonymous is read-only.
- [x] Visibility is per-entry (`FriendVisibility`: `PUBLIC` / `FRIENDS_ONLY` /
      `NONE`), settable any time (not locked after onboarding); `NONE` skips asking
      for a birthday during onboarding.
- [x] **Claiming, not auto-detection.** Skipping onboarding never creates an
      `Association`, which leaves any unassociated `BirthdayDetails` entry open to
      a later claim (`POST /friends/:id/claim`) by whoever it belongs to — there's
      no automatic email-matching "is this you?" detection, just the guarantee that
      an entry can only ever be claimed once.
- [x] Onboarding progress persists via real writes against the user's own
      `BirthdayDetails`/`Association` records as each step completes; only the
      wizard's *current step position* is cached client-side (localStorage), since
      the answers themselves are already durable server-side.
- [x] Declining onboarding is permanent — no re-prompt; manual "add myself" entry
      point (on the Add Friend page) covers users who change their mind later.
- [x] Connections are many-to-many between `User` and `BirthdayDetails` (not
      `User`↔`User`) — the onboarding picker selects from existing directory
      entries, most of which have no account of their own.

## User stories (all confirmed and implemented, see PRD.md for full AC)

- [x] US1 — Browsing & Finding Friends (calendar/timeline toggle, client-side
      search/sort/group-by over the visibility-filtered list)
- [x] US2 — Self-Service Onboarding Wizard (opt-in → visibility → conditional
      birthday → connections multi-select with debounced+paginated search →
      resumable → skippable)
- [x] US3 — Adding Yourself Later (manual entry point after a skip)
- [x] US4 — Role-Based Mutation Access (admin / member / anonymous)
- [x] US5 — Friendship Connections (many-to-many persistence, no graph UI yet)

## External integrations confirmed

- [x] Google OAuth (login) — reused as-is, no new scopes. Note: the basic ID token
      flow does not include a birthday claim, so the onboarding birthday step is a
      manual entry form, not a "confirm from Google" step as originally sketched.
- [x] No other external integrations for this pass.
- [ ] Noted, not scheduled: a future "Tinyfish" integration to auto-import a user's
      connections. No env vars reserved, no discovery done yet.

## Resolved during implementation

- [x] Prisma migration `20260729102748_friends_v2_rbac_onboarding` adds `Role`,
      `OnboardingStatus`, `FriendVisibility` enums; `AppConfig`; `Association`;
      renames `Friend` → `BirthdayDetails` with `addedById`/`visibility`; adds
      `Connection` (User↔BirthdayDetails, unique pair).
- [x] Calendar view: `apps/friends/src/components/CalendarView.tsx` +
      `hooks/useCalendarMonths.ts` — a 12-card month grid, not a day-level calendar.
- [x] Debounced search: `packages/libs/src/hooks/useDebouncedValue.ts` (shared —
      used by both the directory search and the onboarding connections picker).
- [x] `GoogleLoginButton` restyle: switched to Google's `filled_black` / `pill`
      preset (full custom colors aren't permitted by Google's branding rules).
- [x] OpenAPI operationIds: `searchFriends`, `claimFriend`, and the `onboarding*`
      set (`onboardingState`, `onboardingOptIn`, `onboardingSetVisibility`,
      `onboardingSetBirthday`, `onboardingAddConnections`, `onboardingComplete`,
      `onboardingSkip`).
- [x] Pagination for the connections picker: offset-based (`page`/`pageSize`),
      matching the simplicity of the rest of this API — no cursor pagination
      elsewhere in the repo to stay consistent with.

## Known follow-ups (not blocking, not built)

- [ ] `GET /friends/search` filters by name only — social handles live in an
      unstructured JSON column not practical to filter portably at the DB layer.
      The main directory view's search (US1) covers handles client-side instead,
      since that list is already fully fetched.
- [ ] No admin UI yet for changing `AppConfig.adminEmail` — it's only seeded/DB-
      editable today.
