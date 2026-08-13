# Profile model — implementation checklist

See [PRD.md](./PRD.md) for the reasoning behind each decision.

## Schema

- [x] `User` reduced to login identity; `handle` and the never-shipped
      `displayName` column both removed from it.
- [x] `BirthdayDetails` renamed to `Profile`; `name` renamed to `displayName`
      (required).
- [x] `Profile.userId String? @unique` replaces the `Association` table, which
      is dropped.
- [x] `Profile.handle String? @unique` moved off `User`.
- [x] `Birthday` extracted, with required `month`/`day`, its own `visibility`,
      and `gcalEventId`. Cascades on profile delete.
- [x] `Profile.visibility` and `preferAnonymous` dropped.
- [x] One hand-written migration
      (`20260814000000_profile_and_birthday_split`), renaming rather than
      recreating so `AvatarVersion.ownerId` keeps resolving.
- [x] `prisma migrate diff --exit-code` reports zero drift after applying.

## Backend

- [x] `friends.service.ts` (860 lines) split into `ProfilesService`,
      `BirthdaysService` and `SocialGraphService`, with `viewer-context.ts`,
      `profile.mapper.ts`, `birthday-visibility.ts` and `birthday-grouping.ts`
      holding the shared pieces.
- [x] One `FriendsController` retained as the `/friends` API surface — route
      order (`:id` vs `search` / `social-graph`) makes splitting controllers a
      hazard, and the split the change needed was of the service anyway.
- [x] Birthday queries invert to start from `Birthday` and include the profile.
- [x] `toFriendDto` nulls the birthday fields when the viewer may not see them.
- [x] Per-query `User` join removed — `handle` and `displayName` are on the
      profile, so `PROFILE_INCLUDE` is just `{ birthday: true }`.
- [x] `claim()` no longer seeds a display name: the profile already has the
      right one.
- [x] `auth.toUserDto`, `toPublicUserDto`, `users.search`, `updateMe`,
      `generateUniqueHandle`, admin listing and the dev seed all retargeted.
- [x] Onboarding: profile created already-claimed, visibility carried into
      `setBirthday`, `NONE` deletes the birthday row.

## Frontend

- [x] `preferAnonymous` checkbox and its four i18n keys removed.
- [x] Onboarding wizard holds the visibility choice until the birthday step.
- [x] Orval client regenerated and committed.

## Verified

- [x] All 17 profiles list anonymously; `FRIENDS_ONLY` and `NONE` birthdays
      come back nulled while the profile itself stays visible.
- [x] Create with a birthday, create without one, add a birthday to a profile
      that had none (upsert from nothing), and a visibility-only update against
      a profile with no birthday (no-op, not a crash).
- [x] Invalid dates still rejected (Feb 30 → 400).
- [x] `PATCH /users/me` writes handle + display name to the profile;
      `GET /friends/:handle` resolves by it.
- [x] `/auth/me` resolves name, handle and avatar from the profile, falling
      back to Google values when there is no profile.
- [x] Social graph and upcoming sections both 200 with correct gating.
- [x] Full onboarding walk on a fresh account: opt-in → profile → handle →
      visibility → birthday → complete, ending `COMPLETED` with the profile
      supplying name and handle.
- [x] Connection lifecycle across two accounts: request, notification with the
      actor resolved through the rewritten user shape, accept, disconnect.
- [x] `FRIENDS_ONLY` birthday is hidden before accept, visible after, hidden
      again after disconnect, and never visible anonymously.

## Bugs found and fixed during verification

- [x] **`/friends/search` returned zero rows.** `NOT: { userId: viewer.id }`
      drops every row where `userId IS NULL` — i.e. every unclaimed profile —
      because SQL compares NULL as unknown rather than true. Replaced with an
      explicit `OR: [{ userId: null }, { userId: { not: viewer.id } }]`.
- [x] **Claiming your profile locked you out of it.** `canEdit` was
      `addedById === viewer.id`, so a profile someone *else* added returned
      `isViewerEntry: true, canEdit: false` to its owner after claiming, and
      `PATCH /onboarding/profile` answered 403 — the account could never set
      its own display name or avatar. Ownership is now: an unclaimed profile
      belongs to whoever added it; a claimed one belongs to its owner.
      This also closes the reverse hole, where the adder could edit or wipe
      somebody else's claimed identity.
- [x] `remove()`'s field-clearing branch became unreachable under that rule and
      was dropped; deleting a claimed profile is now a plain 403.
- [x] `listAvatarVersions` built a viewer context it never used, costing a
      connection-graph fetch per call.
- [x] Three `navigate()` calls in friends pages returned a floating promise
      (react-router v7 returns one), silently swallowing rejections.

## Not done

- [ ] Applied to production. The migration is written and verified locally
      only.
- [ ] `FriendVisibility` rename (see PRD follow-ups).
- [ ] A birthday cannot be cleared once set — `UpdateFriendDto` can't express
      it, so blanking the form leaves the row. Pre-existing, now more visible.
