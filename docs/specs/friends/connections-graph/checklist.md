# Connections graph — implementation checklist

See [PRD.md](./PRD.md) for the reasoning behind each decision.

## Schema

- [x] `ConnectionStatus` enum (`PENDING` / `ACCEPTED`).
- [x] `Connection` rewritten to `requesterId` ↔ `addresseeId` + `status` +
      `respondedAt`, unique on the pair, indexed on `(addresseeId, status)`.
- [x] `BirthdayDetails.connections` relation removed; `addedById` is now the
      only "who knows this entry" link.
- [x] `Role` enum and `User.role` column dropped.
- [x] `Notification` + `NotificationType`, reusing `AppScope`. `subjectId` is
      deliberately not an FK (same precedent as `AvatarVersion.ownerId`).
- [x] Three hand-written migrations (`migrate dev` can't run non-interactively
      here). The connection one converts in place: drop unconvertible rows →
      backfill through `Association` → drop self-links → dedupe reciprocal
      pairs via `LEAST/GREATEST` → `SET NOT NULL` → swap constraints.
      `migrate diff --exit-code` reports no drift.

## API

- [x] `connections` module: list, list requests, request (auto-accepts a
      reverse pending), accept, withdraw/decline, disconnect. Connection and
      notification writes share one transaction.
- [x] `notifications` module: feed, unread count, mark read, mark all read.
      Subjects resolved at read time, batched by type; rows with a vanished
      subject are dropped.
- [x] `admin` module: `AdminGuard` (derived admin email + `x-admin-key`) and
      `GET /admin/birthdays` for the unfiltered listing.
- [x] `GET /users/search` — claimed accounts only, `PublicUserDto` shaped.
- [x] `friends`: `viewerIncludes` no longer joins connections; a `ViewerContext`
      is resolved once per request and threaded down. `FRIENDS_ONLY` is a real
      circle check in both the Prisma `where` and the in-memory `canView`.
- [x] `POST /friends/:id/connect` + `DELETE /friends/:id/connect` kept as
      entry-shaped wrappers so the profile page never needs an account id.
- [x] `claim` links the claimer to the entry's adder as ACCEPTED.
- [x] Social graph rebuilt on `circle(userId)`. Fixed three pre-existing bugs
      while rewriting: the viewer could appear as their own friend-of-friend,
      depth-2 wasn't deduped against depth-1 (duplicate React keys), and the
      cap was applied before the visibility filter.

## Caching

- [x] `libs/cache.ts` — read-through Redis helper; a cache failure falls back to
      loading directly rather than failing the request.
- [x] Admin email (TTL 300s), connection context (600s), unread count (300s).
- [x] Invalidated explicitly on both sides of every connection mutation and on
      claim, rather than left to expire.

## Frontend

- [x] `isConnected: boolean` → `connectionStatus` (`NONE` /
      `PENDING_OUTGOING` / `PENDING_INCOMING` / `ACCEPTED`).
- [x] `useFriendConnection` maps that to the single action available; connect
      and accept hit the same endpoint since the API auto-accepts.
- [x] Bell nav item with unread badge (`NavBadge`), `/notifications` page with
      inline accept/decline. Count query disabled when signed out.
- [x] `user.role === 'ADMIN'` → `user.isAdmin` across `friends` and `art`.
- [x] Onboarding picker searches accounts; `AddConnectionsDto.userIds`.
- [x] Strings added to `friends.json` in all four locales.

## Verified

26 end-to-end assertions across three accounts (request → accept → notify →
`FRIENDS_ONLY` grant → disconnect → revoke, reciprocal auto-accept, cancel
clearing the badge, claim inheritance, admin gate, no PII on `/auth/me`).

## Not done

- [ ] Per-item read-on-view for notifications (only "mark all read" exists).
- [ ] Anything emitting `BIRTHDAY_REMINDER` / `SYSTEM`.
- [ ] Blocking/muting or a re-request cooldown.
- [ ] An admin screen consuming `GET /admin/birthdays`.
- [ ] `apps/art`'s admin section still has no way to supply `x-admin-key`, so
      its admin routes are unreachable from that UI until a key entry is added.
