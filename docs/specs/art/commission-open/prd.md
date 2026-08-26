# Commission Opening — PRD

Source diagram: [`../flows/commission-open.bpmn`](../flows/commission-open.bpmn)

## Problem

Artists on `apps/art` run commission intake manually: DMs, a separate Google
Form for submissions, manual review, then Trello cards to track accepted work.
There is no connected flow from "I'm open for commissions" to "these are my
confirmed slots," and no way for interested clients to hear that an opening
started.

## Scope

- `apps/art` (artist-facing admin UI, client-facing submission form)
- `apps/api` (extends the existing `commissions`, `commission-types`,
  `commission-pricing` modules)
- Reuses existing infra: S3 uploads (`images.service.ts` + `Storage`), auth,
  and the global `EmailService` (`apps/api/src/infra/email.ts`) — no new email
  module.

Out of scope for this pass:

- Auto-posting the announcement to external platforms (Twitter/Facebook/etc).
  The artist still authors and edits the post content; publishing is deferred.
- Collaboration — a commission belongs to exactly one artist. A future
  `CommissionCollaborator` join table is the right shape when it lands; a
  nullable "assignee" is not.
- Progress-image tracking was folded in (see Use Case 8). Gallery curation is
  handled by repurposing `Project` to group final progress entries, so no
  separate `GalleryItem` model is needed.

## Data model

The schema lives in `apps/api/prisma/schema.prisma`. Per `docs/conventions.md`
that file carries no comments, so the reasoning is here.

### The pipeline

Two entry points lead to the same place — an individual commission, or a
project brief that a group of people join:

```
CommissionOpening ──┐
   (per artist)     │
                    ├──→  Commission (+ CommissionDetail)  →  CommissionProgress
Project ──→ Group ──┘        (one per client)                   (timeline posts)
 (brief)   (members,                                                   │
            shared price)                                              ↓
                                                              Project.artworks
```

There is **no separate request/application model.** An earlier draft had
`CommissionRequest` as a lightweight pre-commission entity, but it duplicated
`Commission` almost field for field (idea, deadline, type/option/addons, quote,
client identity, references). Instead, `CommissionStatus` gained three
pre-production values ahead of the existing pipeline:

```
PENDING → ACCEPTED → DECLINED → NOT_YET_STARTED → QUEUED → SKETCH
        → CONFIRMED → ONGOING → COMPLETED → CANCELLED
```

A client submission creates a `Commission` directly at `PENDING`. Accepting
moves it to `ACCEPTED`; confirming moves it into the production pipeline at
`NOT_YET_STARTED`. "Replace a slot" is two status transitions, not a bespoke
operation.

**A commission does not require an opening.** Both `commissionOpeningId` and
`groupId` are nullable, giving three intake paths into the same pipeline:

| Path | `commissionOpeningId` | `groupId` |
| --- | --- | --- |
| Public submission during an open window | set | null |
| Member of a project group | null | set |
| Private / direct (artist takes it themselves) | null | null |

A private commission is an artist creating one directly — a returning client, a
DM, work agreed off-platform. It skips triage entirely: the artist creates it
straight at `NOT_YET_STARTED` rather than `PENDING`, since there is nothing to
accept or decline. The `PENDING` default only applies to submissions that
arrive through an opening.

Consequences: closing an opening never blocks a private commission (the lock is
only on public submission), private commissions do not count against an
opening's slot cap (they have no opening), and the `auto-accept-commission`
setting is irrelevant to them. The artist still needs a `Client` — resolved by
email against the existing row, or created.

### Commission / CommissionDetail split

`Commission` is the thin wiring record: `status`, `priority`, the artist, the
client, the originating opening, payment method, access code, project.
`CommissionDetail` (1:1) holds everything production-specific: `idea`,
`deadline`, `paymentStatus`, `isHiddenInQueue`, type/option/addons, pricing,
reference assets, and the checklist timestamp chain.

### Multi-artist

The app serves **many artists**, and a commission belongs to exactly one.
`Commission.artistId` is required. `CommissionOpening.artistId` means an
opening is a singleton **per artist**, not globally — one artist being open
says nothing about another. `CommissionFollower` is `@@unique([artistId,
email])`: you follow an artist, not the site.

This replaced an earlier nullable `assignedToId`. Two columns both answering
"whose commission is this" can disagree; one required owner cannot.

### Client identity

`Client` (unique `email`, name, preferred contact method, handle) replaces the
per-commission copies of client fields. One person commissioning five times was
previously five diverging copies of their own name and contact details.

`Client.userId` is a nullable link to a real platform account — clients are not
required to authenticate to commission. This model is also what makes prefill
work: look up by email, reuse the row, and a returning client only fills in the
idea, references and deadline.

### Anonymous access

**Clients never log in.** Authorization is the access key alone:
`Commission.accessCode` for your own piece, `CommissionGroup.accessCode` for a
group you're part of. Both are `@unique @default(cuid())`, and the group code is
what lets a member reach the shared project view and everyone else's pieces.

The **anonymous username is a `Client` field, not a browser-only value.** It has
to be server-side: in a group thread, other members must see who wrote a
comment, and `Comment.authorClientId` resolves to a `Client`. What the browser
remembers is the *convenience* — the client sets a display name once and it is
kept locally so they aren't asked again, keyed per access code so a person
holding two codes can present differently in each.

Because clients arrive without an account, `Client.name` is whatever they chose;
it is not verified and must never be treated as identity. Two consequences:

- The access key **is** the credential. Anyone holding a group code can read
  and comment as that group — so group codes must be treated like passwords in
  the UI (no leaking them into URLs that get shared casually, per the same
  reasoning `Commission.accessCode` already follows).
- A returning anonymous client is recognized by access code, not by name. Names
  are not unique and are freely editable.

### Pricing and currency

Money fields are `quote` and `originalQuote` on `CommissionDetail`, with an
explicit `currency` (artists are not all USD). `originalQuote` snapshots the
quote at accept time so the service can detect "the artist changed the price
since accepting" and require an explanation note before the confirmation email
goes out — without persisting the note itself.

The *system estimate* is not stored. It is derived from the
`CommissionType`/option/addon pricing config (as `useCommissionPricingEstimate`
already does client-side); only the artist's manual quote is persisted.

### Roles

Roles are back, as **tables** rather than an enum: `Role` (`key`, `label`,
`no`) plus a `UserRole` join on `(userId, roleId)`. New roles can be added as
data, without a schema migration.

They were previously dropped (`drop_user_role`), leaving `AuthService.isAdmin`
matching a single email from `SystemParameters` — and no artist concept at all,
even though `Commission.artistId`, `CommissionOpening.artistId` and
`Project.artistId` are all required.

Making someone an artist is now an admin action: grant them the `artist` role.

Because it is many-to-many, a user holds **several roles at once** — the site
owner is realistically both `admin` and `artist`. That removes any need for a
hierarchy where one role implies another.

`isAdmin` should move off the email match onto "holds the `admin` role", which
also removes the single-admin-email limitation. The `user` / `artist` / `admin`
rows need seeding, and the role keys belong in a constants file.

### Per-artist configuration

Everything an artist prices or configures is **theirs**, and editable by them
in `apps/art` — not a global catalog. The previous models were all
single-tenant, the same class of bug as the globally-singleton opening:

| Was | Now |
| --- | --- |
| `CommissionType` (global, `key` unique) | per-artist, `@@unique([artistId, key])`, `basePrice` merged in |
| `CommissionTypePricing` (1:1 side table) | dropped — folded into `CommissionType` |
| `CommissionOptionPricing` | `CommissionOption`, per-artist |
| `CommissionAddonPricing` | `CommissionAddon`, per-artist |
| `CommissionRushFeeSetting` (singleton row) | dropped — `UserSetting`, `scope: ART` |

`CommissionTypePricing` was a 1:1 table that always existed for its parent,
which is just columns with extra joins. `CommissionRushFeeSetting` was two
scalars with nothing pointing at them by FK — exactly what `UserSetting` is
for.

`CommissionType.tagId` is no longer `@unique`: two artists can both offer
"Icon" and should share one gallery `Tag`, so the relation is many-to-one and
nullable.

**Currency is the artist's choice**, stored in `UserSetting` and *snapshotted*
onto `CommissionDetail.currency` / `CommissionGroup.currency` at creation.
Snapshotting matters — an artist switching currency must not silently reprice
work already quoted.

Entity lists stay real tables rather than `UserSetting` JSON because
`Commission` holds FKs into them (`commissionTypeId`) and they need referential
integrity. Only settings with no FK pointing at them (rush fee, currency,
payment-method selection) live in `UserSetting`.

**Every money field is a plain integer named without a currency-specific
suffix** (`basePrice`, `minPrice`, `quote`, the rush fee's `feeAmount` in its
`UserSetting` JSON) — never `*Cents`. `Cents` bakes in an assumption that only
holds for 2-decimal currencies like USD; it is meaningless for a currency like
VND, which has no minor unit at all. The integer is always in the smallest
unit of whatever `currency` says, and interpreting it (whether to divide by
100 for display) is a formatting concern, not a schema one.

`CommissionAddon.minPrice` is deliberately a floor, not a fixed price: an
add-on like "Background" is "from $X", and the actual quote for it is set
manually per commission in `CommissionDetail.quote` rather than computed.

### Payment methods

`PaymentMethod` is a **global, admin-managed catalog** shaped like the existing
`SocialPlatform` (`key`/`name`/`no`/`active`), so artists select from a fixed
list rather than inventing entries.

An artist's *selection* — which methods they accept, plus their own handle or
account details for each — lives in the generic `UserSetting` table at
`scope: ART`, JSON-encoded in `value`. That is what `UserSetting` is for, and
the details are genuinely per-artist.

Consequences for the service layer:

- The `UserSetting.type` key belongs in a constants file, not inlined.
- `Commission.paymentMethodId` is a real FK to the catalog, but the service
  must validate that *this artist accepts that method* — the DB can no longer
  enforce it, since the selection is JSON.

### Groups and projects

These are two different things that both group commissions, and keeping them
separate is deliberate.

**`CommissionGroup` is the working arrangement.** A group commission: many
clients, many commissions, one artist, one shared agreed price
(`quote`/`currency` on the group). Membership is `CommissionGroupMember`, a
join on `(groupId, clientId)` — which is only possible because `Client` is now
a real model with stable identity. `Commission.groupId` is nullable, so a solo
commission is simply one with no group.

Visibility inside a group is **total**: any member can read any commission in
the group, *including its quote*, and comment on it. That is intentional —
a group commission has one price everyone is party to. Access is granted by
membership (your `Client` row is in the group) plus the group's own
`accessCode`, mirroring `Commission.accessCode`. This is the one rule the
schema cannot enforce, so the service layer must.

**`Project` is the originating brief, not a post-hoc showcase.** It is created
*first*, and everything else forms around it:

```
admin creates Project ("a card deck, each card is one of our characters")
        → people who want in join            → CommissionGroup
        → each member's individual piece     → Commission (+ CommissionDetail)
        → shared visibility and comments     → CommissionProgress + notes
        → finished pieces attach back        → Project.artworks
```

`Project.brief` (Json, same rich-text shape as `Commission.idea`) holds the
general concept — "a collection of hexagons, each containing a member of our
group". That is the thing people are agreeing to join, so it has to exist
before the group does.

`CommissionGroup.projectId` is nullable in both directions of use: a group that
formed around a project points at it, and an ad-hoc group commission with no
formal project simply doesn't. A project can likewise exist with no group yet.

Finished work still attaches back to the project via
`CommissionProgress.projectId` (`Commission.projectId` was removed), so a
project is both the brief up front *and* the collected set of final artworks at
the end. That is what makes a separate `GalleryItem` model unnecessary — the
finished artwork *is* a progress entry.

`Project.isHidden` **defaults to `true`.** A project now exists from the moment
the idea is proposed, long before there is anything to show, so it must not be
publicly visible by default. The old default of `false` came from the
superseded model where a project was assembled only after the work was done.

`Project.artistId` is required, for the same reason openings and commissions
are artist-scoped: in a multi-artist app an unowned project is ambiguous.

Note that `Project.isHidden` and `CommissionDetail.isHiddenInQueue` are now
cleanly distinct: one hides a finished gallery set, the other hides an
in-flight commission from the public queue.

### Progress timeline

`CommissionProgress` is one timestamped entry per update: optional `title`,
rich-text `body` (Json, same as `idea`), **multiple** `images`, and a
`visibility` reusing `CommissionNoteVisibility`.

Delivered artwork is **not** a separate field. An earlier draft had
`deliverableAssets` alongside `referenceAssets`; the final artwork is simply a
progress entry with `isFinal: true`. `CommissionDetail.deliveredAt` records
when.

`CommissionProgress` has no `authorId`: with one artist per commission the
author is always `commission.artist`, so the column would add a way for the
record to disagree with its owner and no behaviour a join doesn't give. It
comes back with collaboration.

### Comments

`CommissionNote` became **`Comment`**: every "card" in the app has its own
comment section, Trello-style. It attaches to exactly one of four subjects via
nullable FKs:

| Subject | Discussion about |
| --- | --- |
| `projectId` | the overall brief — "should the hexagons be uniform?" |
| `groupId` | the group arrangement — scheduling, shared price |
| `commissionId` | one member's piece as a whole |
| `progressId` | one specific WIP post |

Nullable FKs were chosen over a polymorphic `subjectType` + `subjectId` (the
pattern `Notification` uses). Polymorphic has no referential integrity and no
cascade, so deleting a progress entry would silently orphan its comments —
the same class of leak as the S3 orphans this feature already had to fix. With
real FKs, `onDelete: Cascade` means a card and its discussion disappear
together.

The cost is that "exactly one subject is set" cannot be expressed in Prisma's
schema DSL, so the service layer must enforce it.

**`authorClientId` identifies which client wrote it.** `authorRole`
(`ARTIST` | `CLIENT`) alone was sufficient when a commission had exactly one
client, but a group has many, and "some client said this" is useless in a
shared thread. The artist side stays derivable from the subject's owning
artist, so there is no `authorId` — same reasoning as `CommissionProgress`.

`authorRole` also replaced inferring the author from `authorId === null`, which
was destined to break: `authorId` also went null when an artist's `User` was
deleted, making a deleted artist's note indistinguishable from a client's.

The enums were renamed `CommissionNoteVisibility` → `Visibility` and
`CommissionAuthorRole` → `AuthorRole`, since neither is commission-scoped
anymore (`Visibility` is also used by `CommissionProgress`).

Service-layer rules the schema cannot express:

- Exactly one subject FK is set.
- A client may only comment where they have access — their own commission, or
  any commission/progress in a group they belong to — and only on
  `CLIENT`-visible subjects. Their comment is forced to `authorRole: CLIENT`
  with their own `authorClientId`, regardless of input.
- `INTERNAL` comments are artist-only scratch notes and are never returned on
  any client-facing read.

### Why `CommissionStatusHistory` stays separate from `CommissionProgress`

Both are "a timestamped thing on a commission", but they are written by
different actors for different readers:

- **Written by whom.** `CommissionStatusHistory` is written automatically on
  every status change, in the same transaction as the update. Progress entries
  are authored deliberately by the artist. Merging them forces one of two bad
  outcomes: every internal transition spams the client timeline, or the artist
  must hand-write a post for each one (they won't).
- **What you can ask it.** History has typed `fromStatus`/`toStatus` columns,
  so "when did this reach CONFIRMED", "how long in SKETCH", "who declined it"
  are plain queries. A progress `body` is rich-text Json and cannot answer
  those. The admin view already renders those arrows.
- **Who it names.** History keeps `changedById` — an audit log's whole point is
  the actor, and an admin acting on a commission genuinely is not the owning
  artist. Progress deliberately has no author.
- **Who reads it.** History defaults to internal; progress defaults to
  `CLIENT`.

The client-facing timeline is therefore a **merged read**: query both, union by
`createdAt`, and filter history down to a small allowlist of client-meaningful
transitions. One rendered timeline, without forcing one table to do two jobs.

The rejected alternative was a single `CommissionEvent` table with a type
discriminator, which leaves `fromStatus`/`toStatus` null on every post and
`body`/`images` null on every status row — and makes the audit trail harder to
trust.

## User Stories

1. As an **artist**, I want to configure a commission opening (open now or
   scheduled, and an end mode — manual toggle, slot cap with optional
   duration, or indefinite) so that I control exactly how and when I accept
   new requests.
2. As an **artist**, I want to review incoming requests in either a card or
   table view, sortable by first-come-first-serve, custom priority, or
   deadline, so that I can triage the way that fits how I work.
3. As an **artist**, I want to accept or decline a request with an undo option
   so that I can move quickly without fear of an irreversible mistake.
4. As an **artist**, I want to manage accepted slots — editing price/status,
   replacing a slot from the pending/declined pool, and sending a confirmation
   email (with a required note if I changed the price) — so that I can finalize
   who I'm actually working with.
5. As an **artist**, I want to delete a submission and have its uploaded S3
   reference image deleted with it, so that declined work doesn't leave
   orphaned files in storage.
6. As an **artist**, I want to take private commissions directly, without an
   opening, so that DM and off-platform work lives in the same system.
7. As a **client**, I want to submit a request (idea, reference image or URL,
   contact handle, optional deadline) during an open window so that I can be
   considered without having to DM the artist.
8. As a **client**, I want to **use the app without logging in** — just my
   access key — and I want the browser to remember the anonymous username I
   set, so that I can take part in a commission or group without creating an
   account, and my comments still show a name people recognize.
9. As a **group member**, I want to see and comment on every piece in the
   project, including the shared price, so that we can coordinate a collection
   we're commissioning together.
10. As a **client**, I want to follow an artist by email so that I hear when
    they open commissions.

## Use Cases

### 1. Artist opens a commission window

Configure an opening: open now or scheduled; end mode of manual toggle, slot
cap (closes once N accepted, with optional duration), or indefinite; plus the
announcement post content.

Indefinite mode gets a different review UI — no slot countdown, no forced end
date.

### 2. Artist triages incoming submissions

Card view (name, contact handle, reference image, idea, price, actions) or
table view (name, contact method, deadline, price, idea, reference, actions).

A reference image falls back to a linked URL with a tooltip when the client
supplied a URL instead of uploading.

Three sort modes: first-come-first-serve, custom priority (artist-defined, via
`Commission.priority`), and by-deadline (undated items fall back to submission
time). Three tabs — Pending, Accepted, Declined — driven by `status`.

Accept/decline take effect immediately with **no confirmation dialog**; an undo
button is the safety net.

### 3. Artist manages accepted slots

An accepted-slots table where name, contact method, deadline and idea are
read-only, and price and status are editable. Actions: Confirm, Replace, Send
Confirmation Email, Delete.

- **Confirm** moves the commission into production (`NOT_YET_STARTED`).
- **Replace** swaps this slot for someone from the pending/declined pool.
- **Editing the price sends nothing on its own.** If the artist then sends the
  confirmation email and the price changed since accepting, a modal requires a
  note explaining why before sending.
- **Send Confirmation Email** is disabled once confirmed (its purpose is to
  *ask* for confirmation), but Replace and Delete stay enabled.

Artists commonly confirm over DM instead. Both paths are supported; the app
does not force the email.

### 4. Closing vs deleting

**Closing an opening only locks it** — `status: CLOSED` stops new public
submissions. It has no side effects on any commission. Everything stays exactly
where it is, in whatever tab it is in; the artist keeps full control of the
data.

**Deletion is always a deliberate per-item action.** Deleting a submission
removes the record *and* its uploaded S3 reference image via
`storage.deleteObject`, so no orphaned objects are left in the bucket.

### 5. Notifications

- Opening starts → notify that artist's followers.
- Accept → notify the client, then the artist.
- The `auto-accept-commission` setting (per-artist, in `UserSetting`) skips the
  manual accept/decline step and its notifications.

### 6. Client submits a request

During an open window: idea, reference image upload or URL, contact details,
preferred payment method, optional deadline. No account required. A returning
client identified by email gets their details prefilled and only fills in
what's new.

### 7. Artist takes a private commission

The artist creates a commission directly, with no opening involved — a
returning client, a DM, something agreed off-platform. It starts in production
rather than triage, and is unaffected by whether the artist's opening is
currently open, closed, or has never existed.

### 8. Artist posts progress

The artist posts timestamped updates with multiple images to the commission's
timeline, marks one final on delivery, and the client can reply to individual
entries.

## Migrations

Applied, in order, against local dev (`localhost:5437`/`hatohui`):

1. `20260827033240_commission_status_add_intake_values` — adds `PENDING`,
   `ACCEPTED`, `DECLINED` to `CommissionStatus`. Split into its own migration
   because Postgres cannot use a new enum value in the same transaction that
   adds it (the SQL Prisma generates for a schema diff puts both in one file;
   this had to be split by hand).
2. `20260827033249_commission_opening_client_roles` — the bulk of this
   feature's schema: every model change described above. Drops
   `CommissionTypePricing`, `CommissionOptionPricing`, `CommissionAddonPricing`,
   `CommissionRushFeeSetting`, and the old `CommissionNote`.
3. `20260827033300_seed_roles_and_backfill_users` — hand-written, not
   schema-generated. Seeds the three base `Role` rows (`user`/`artist`/`admin`,
   `ON CONFLICT DO NOTHING`), grants every existing `User` the `user` role, and
   grants `admin` + `artist` to whichever user's email matches
   `SystemParameters['admin.email']` — preserving the one admin the old
   email-based check recognized. **No `User` row is touched or dropped by any
   of the three migrations.** Verified by simulating two production-shaped
   users (an admin-email match and a plain user) in a transaction, then rolling
   back.

The local dev database was reset (`prisma migrate reset`) to apply migration 2
without a manual data-loss workaround — it held only reproducible seed data (no
`User` or `Commission` rows). **Production has real users and must not be
reset**; migration 3 is what makes deploying this to production safe despite
that reset having been fine locally.

## Grounding

No new external integrations.

- Email → existing global `EmailService`.
- Images → existing presigned-upload path; deletion goes through
  `Storage.deleteObject` so S3 objects actually go away.
- Auth/admin gating → moves from `SystemParameters['admin.email']` to the
  `admin` role (see Roles); the code cascade must update
  `AuthService.isAdmin` accordingly.

## Open items

- Rename this spec folder to `commission-opening/` to match the model name.
- `Commission.artistId` is required, but the current public `POST /commissions`
  has no artist in scope. The submission route must become artist-scoped
  (resolved through the opening being submitted to).
- Enforcing "one active opening per artist" is a service-layer check; Prisma's
  schema DSL cannot express the partial unique index.
- `AuthService.isAdmin` still checks the email parameter, not the `admin` role
  — switch it during the code cascade.
- `prisma/seeds/core/commission-pricing.ts` seeds the now-dropped
  `CommissionTypePricing`/`CommissionOptionPricing`/`CommissionAddonPricing`/
  `CommissionRushFeeSetting` models. `task db:seed` is broken until this is
  rewritten for per-artist `CommissionType`/`CommissionOption`/
  `CommissionAddon`, plus a role-seeding step (roles are currently seeded only
  by migration 3, not by `seedCore`).
- Role keys (`user`/`artist`/`admin`) should move into a constants file
  (`docs/conventions.md`: "Literals go in `constants/`") once the code cascade
  touches auth.
