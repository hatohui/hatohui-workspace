# Connections as a real social graph

Supersedes parts of [directory-rbac-onboarding](../directory-rbac-onboarding/PRD.md).

## Problem

`Connection` was built for one onboarding step ("do you already know anyone
here?") and modelled as `User` → `BirthdayDetails`. That conflated two
different ideas:

1. **"I know this directory entry"** — already answered by
   `BirthdayDetails.addedById`, which records who created the entry.
2. **"These two people know each other"** — an account-level relationship that
   has nothing to do with birthdays, and which travel/art/workspace will want.

Three consequences followed from the conflation:

- `FriendVisibility.FRIENDS_ONLY` had no relationship to check against, so it
  was implemented as "any signed-in user" — a privacy setting that didn't do
  what its name said.
- The connection had no consent step: anyone could add anyone, with no accept,
  and no way to undo it (there was no unfriend path at all).
- Every `BirthdayDetails` query joined `Connection` purely to compute one
  boolean (`isConnected`), coupling the friends module to a relation that
  belonged one level up.

## Decisions

- **`Connection` is now mutual and account-to-account** — `requesterId` /
  `addresseeId` / `status (PENDING | ACCEPTED)`, one row per pair, read
  symmetrically. It lives in its own `connections` module, not inside
  `friends`, because it is not birthday-specific.
- **`BirthdayDetails.addedById` is the only "who knows this entry" link.** The
  entry-oriented connection is gone. Accepted trade-off: you can no longer add
  *someone else's* entry to your own circle. Viewing is unaffected — the
  directory stays public — so this only narrows the social-graph view.
- **`FRIENDS_ONLY` means the owner's accepted connections.** Owner = the
  associated account if the entry is claimed, otherwise whoever added it.
  This makes the setting truthful and, because connections are revocable,
  actually revocable.
- **Claiming an entry inherits its connections.** Claiming an entry someone
  else added creates an ACCEPTED connection with that person outright — they
  already know you, so a request would be theatre. At migration time the same
  rule converted existing rows.
- **Mutual intent doesn't deadlock.** If B requests A while A already has a
  pending request out to B, the existing request is accepted rather than a
  second one created.
- **Admin powers no longer apply on normal routes.** An admin browsing the app
  is just a user; the unfiltered listing moved to `GET /admin/birthdays` behind
  a dedicated guard. `User.role` was dropped entirely — it was a cache of
  "email == AppConfig admin email" computed only at login, so it went stale
  whenever that config changed. It is now derived per request.
- **Admin routes need two independent factors:** the session's email must match
  the configured admin address *and* the request must carry `x-admin-key`
  (`ADMIN_API_KEY`). A stolen session cookie alone reaches nothing.
- **No contact PII leaves the API.** `UserDto` lost `email`; anything
  describing a *third party* uses `PublicUserDto` (`id`, `name`, `handle`,
  `avatarUrl`) and a shared `PUBLIC_USER_SELECT` so extra columns can't leak by
  accident. The admin badge is driven by a derived `isAdmin` boolean rather
  than exposing a role enum.
- **Notifications are generic from day one.** A `Notification` model keyed off
  the existing `AppScope` enum, with a non-FK `subjectId` discriminated by
  `type` — the same trick `AvatarVersion.ownerId` already uses. Connection
  requests are the only source today; travel/art can push into the same inbox.
  Content is never denormalized: handles are mutable and "deleted" entries are
  field-cleared, so subjects are re-resolved at read time.

## Acceptance criteria

- **AC1 (Consent):** A request is PENDING until the addressee accepts. Either
  side can withdraw/decline; either side can disconnect once accepted.
- **AC2 (Privacy):** A `FRIENDS_ONLY` entry is visible to the owner's accepted
  connections and to whoever added it, and to nobody else — including in list
  endpoints, not just direct fetches. Disconnecting revokes it immediately.
- **AC3 (Inheritance):** Claiming an entry connects the claimer to its adder
  with no request step.
- **AC4 (Inbox):** A request produces exactly one notification for the
  addressee. Withdrawing or declining removes it, so the inbox never shows a
  dead item with live action buttons. Accepting keeps it as history and
  notifies the requester.
- **AC5 (Admin):** Admin-only routes require both the configured admin email
  and the admin key; failing either is a 403. Non-admin routes treat admins
  exactly like members.
- **AC6 (PII):** No endpoint returns an email address, including `/auth/me`.

## Not doing

- **No per-notification read tracking in the UI.** `readAt` exists per row and
  "mark all read" is implemented; per-item read-on-view is not.
- **No generic notification fan-out beyond connections.** `BIRTHDAY_REMINDER`
  and `SYSTEM` exist in the enum but nothing emits them yet.
- **No blocking / muting.** Repeated request-cancel-request can still ping
  someone's bell; a cooldown or block list is a service-layer concern for
  later.
- **No admin UI for the unfiltered listing.** The endpoint exists; no screen
  consumes it yet.
