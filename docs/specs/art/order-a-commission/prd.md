# Order a commission — identity and contact points

Implements [`../flows/order-a-commission.bpmn`](../flows/order-a-commission.bpmn).
Builds on [`../commission-open/prd.md`](../commission-open/prd.md), which owns
the `Client` model, submission and the anonymous access-code model.

## Problem

A commissioner who isn't logged in typed a name and email on every order, and
`Client` held a single `preferredContactMethod` + `contactHandle`. The rest of
the platform already has a public identity with contact points — the friends
app's `Profile` (`handle`, `socialMedias`, claimable via `userId`) — and the two
never met: an art commissioner had no presence anywhere else, and a friends
profile's socials were invisible to the artist.

## Decisions

- **The identity is `Profile`, not `Client`.** `Profile` is "the record every
  app in the workspace points at" (see
  [`../../friends/profile-model/PRD.md`](../../friends/profile-model/PRD.md)).
  `Client` stays the art-side record — email, commissions, groups — and gains a
  nullable `profileId`. It is not unique: one person may commission under two
  emails.
- **Contact points are `Profile.socialMedias`**, keyed by the platform's
  display name (`SocialPlatform.name`) — that is how the friends app already
  writes and renders them, so the art side follows it rather than forking the
  shape.
  A new contact entered while ordering is written back to the profile, so the
  friends app sees it too. `email` is a pseudo-platform: the value is
  `Client.email`, and it is never written into `socialMedias`.
- **Each commission snapshots the contact it was placed with**
  (`CommissionDetail.contactPlatform` / `contactValue`). Editing a profile later
  must not change how the artist was told to reach someone for an existing
  order.
- **`Client.preferredContactMethod` / `contactHandle` are kept, derived.** They
  are written from the chosen contact point (`X (Twitter)` → `TWITTER`,
  `Discord`, `Telegram`, `email`, anything else → `OTHER`) so the artist-side screens keep
  working unchanged. Removing them is a follow-up once those screens read the
  snapshot instead.

## Identity resolution on submit

| Situation | Identity used |
| --- | --- |
| Logged in, has a profile | Their own profile |
| Logged in, no profile (skipped onboarding) | None — they opted out of a public persona; contact goes on the snapshot only |
| Anonymous, confirmed a suggested match | The matched profile. Its existing fields are never overwritten; a new contact is added only to an **unclaimed** profile, and only for a platform it has no value for |
| Anonymous, no match / said "not me" | A new unclaimed profile (`addedById` null), handle from the typed handle or name via the platform's `generateUniqueHandle` |

The handle suffix follows the platform's existing generator (`luke`, `luke_2`)
rather than the diagram's `luke1`, so handles look the same whichever app
created them.

## Similar-identity detection

`POST /clients/identity-match` (POST so the email never lands in a URL or
access log). Matches, in order: the profile behind a `Client` with that exact
email, an exact handle, an exact case-insensitive display name. Returns at most
three profiles in the public shape the friends directory already exposes — no
email, no client id.

The UI must not signal that matching happens: no spinner, no placeholder, no
"checking…". The suggestion appears only once a match exists, after the user
stops typing.

**Accepted risk:** anyone can pick "that's me" for someone else's profile.
There is no verification, by decision — the storefront is not an official
channel. What limits the damage: the matched profile's fields are never
overwritten, a claimed profile is never written to, and the directory data
shown is already public.

## Claiming on Google login

Google verifies the email, so on every login any `Client` with the user's email
is linked (`Client.userId`, if the user has no linked client yet), and its
profile is claimed:

- **User has no profile** → the unclaimed profile gets `userId`. Same one-way
  claim as `ProfilesService.claim`.
- **User already has a profile** → the client moves onto the user's profile,
  contact points the user doesn't already have are copied over, and the
  leftover unclaimed profile is deleted — unless the friends app still
  references it (a birthday, an `addedById`, or another client), in which case
  it is left alone.

Name or handle matches never claim anything; only a verified email does.

## Consequences

- Commissioners now appear in the friends directory, which lists every profile.
  That is intended — the platform is one identity space.
