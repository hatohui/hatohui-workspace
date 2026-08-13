# Profile as the public half of a person

Supersedes the entry/account split described in
[directory-rbac-onboarding](../directory-rbac-onboarding/PRD.md), and changes
what `FriendVisibility` governs in
[connections-graph](../connections-graph/PRD.md).

## Problem

`BirthdayDetails` had become a god-table. It held three unrelated things at
once: who a person is to the world (name, avatar, socials), one app's fact
about them (their birthday), and the link back to a login (via `Association`).

That conflation produced a specific, recurring class of bug. The display name
and avatar lived on the *entry*, so anything holding a `User` — the sidebar,
the social tree, notifications — reached for `User.name` / `User.avatarUrl` and
rendered the raw **Google identity** instead of what the person had chosen. The
fix kept being applied one call site at a time (`entry?.avatarUrl ?? user.avatarUrl`
scattered through the frontend), which is the tell that the model was wrong
rather than the callers.

`handle` had the same problem from the other direction: it described a public
persona but was stored on `User`, the private login record.

## Decisions

- **`User` is login identity only.** `googleId`, `email`, `name`, `avatarUrl`,
  `onboardingStatus`. Nothing here is ever displayed; `name`/`avatarUrl` are
  Google's copies, kept only as a fallback and as the seed for a new profile.

- **`Profile` is the public half of a person**, and the record every app in the
  workspace points at. It owns `displayName`, `handle`, `avatarUrl`/`avatarKey`
  and `socialMedias`. Most profiles are *unclaimed* — added by someone about a
  third party, with no account behind them at all.

- **`displayName` is required, not nullable.** An unclaimed profile is named by
  whoever added it; a claimed one is seeded from the Google name at onboarding.
  This is what removes the `displayName ?? user.name` fallback everywhere: there
  is always exactly one name, and it is always the right one.

- **`Association` collapses into `Profile.userId`** (`String? @unique`). Same
  1:1 guarantee, same permanence, one less join on every read. The claim is
  still one-way: "deleting" a claimed profile clears its fields but keeps the
  row, so the slot can never be re-claimed.

- **`Birthday` is its own table.** It is one app's concern, not part of who
  someone is — art/travel/www want profiles without one. Absence is modelled as
  a missing row, which is why `month`/`day` are **required** there: the old
  nullable columns could represent a half-set date that no code path wanted.

- **Only the birthday has `visibility`.** The directory itself is public and
  meant to be browsed — onboarding's "do you already know anyone here?" step
  scrolls the whole thing. The birthday is the sensitive part, so that is where
  the setting lives. `NONE` and "no birthday row" now mean the same thing.

- **`preferAnonymous` is gone.** It was written by the API, echoed back in
  DTOs, and had a checkbox in the UI, but no visibility check ever read it.

- **`addedById` stays on `Profile`, not `Birthday`.** It answers "who created
  this person's record", which is profile-level: it drives circle membership,
  `FRIENDS_ONLY` matching, `canEdit`, and the auto-connection on claim.

## Consequences

- **The API surface is unchanged.** `FriendDto` still carries `birthYear` /
  `birthMonth` / `birthDay` / `visibility` as flat fields even though they now
  come from a joined table. This is an internal model change; making it an API
  change too would churn every frontend component for no user-visible gain.
- Those birthday fields are now **null when the viewer may not see them**, where
  previously the whole entry was hidden. A profile is always visible; its date
  may not be.
- `visibility` is `null` when a profile has no birthday to govern.
- Onboarding's visibility step runs *before* the birthday exists, so the choice
  is carried into `setBirthday` rather than applied when it is made. Choosing
  `NONE` deletes any existing birthday row instead of flagging one.
- An account that skips onboarding has no profile, and therefore no handle.
  That is correct — they opted out of having a public persona.

## Why the migration renames rather than recreates

`AvatarVersion.ownerId` and `Notification.subjectId` both reference these ids
with **no foreign key** to protect them (deliberately — see connections-graph).
`ALTER TABLE "BirthdayDetails" RENAME TO "Profile"` preserves every id, so
avatar history survives. A drop-and-recreate would have silently orphaned all
of it, with nothing to fail loudly at.

Extracted `Birthday` rows get `gen_random_uuid()` ids rather than reusing the
profile's id. Reusing it would have been convenient but would break the
globally-unique-id assumption that the two non-FK columns above rely on: a
`subjectId` could then resolve to either a Profile or a Birthday.

## Who may edit a profile

An **unclaimed** profile belongs to whoever added it. A **claimed** one belongs
to the person it describes, and the adder loses control of it.

This had to change with the model. Previously `canEdit` was
`addedById === viewer.id`, which was defensible when the row was just "a
birthday someone wrote down" — but once the row *is* a person's identity, that
rule meant claiming a profile someone else created left you permanently unable
to set your own name or avatar (`PATCH /onboarding/profile` answered 403),
while the person who added you could still rewrite it.

A consequence: a claimed profile can no longer be deleted by anyone, including
its owner. That preserves the existing permanence invariant — the claim was
always one-way — and makes it explicit rather than expressing it as a
field-clearing side effect.

## Known follow-ups

- `FriendVisibility` now lives only on `Birthday`, so the name is stale.
  Renaming it is deliberately deferred: the API surface is still `/friends` and
  `FriendDto.visibility`, so renaming the enum alone would create a fresh
  mismatch rather than remove one. Rename both together, or neither.
- A birthday cannot be cleared once set: `UpdateFriendDto` has no way to
  express "remove the date", so blanking the form leaves the row in place.
