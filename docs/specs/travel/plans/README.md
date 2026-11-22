# Travel plans, groups, and activity timeline

A **participation** records one person's travel window, leave type, and flight
details for an event or standalone trip. Participations belong to a
**participation group** (a shared travel plan) that owns the itinerary, photo
gallery, visibility flags, and membership rules.

## Model

```text
TravelEvent (optional)
     │
     ▼
TravelParticipationGroup ──< TravelParticipation ──> User
     │  │  │
     │  │  └──< TravelJoinRequest ──> User
     │  └──< TravelGroupImage
     └──< TravelActivity ──< TravelActivityMedia
                │
                └──> TravelPlace (optional)
```

- **Lazy group creation.** A solo participation can start without a group or
  auto-create a single-member `TravelParticipationGroup` named `"My Plan"` on
  creation or when the user first invites someone, adds an activity, uploads a
  photo, or opens group settings.
- **No overlapping participations.** A user cannot hold two participations whose
  `[from, to]` windows overlap, whether created directly, via co-traveler
  addition, invite acceptance, or join-request approval.
- **Per-member travel details.** Each `TravelParticipation` stores `from`, `to`,
  `leaveType` (`ANNUAL` | `SICK` | `UNPAID`), `isAlreadyHere` (already at the
  destination, so synthetic arrival/departure cards are suppressed for them),
  `entryFlight`, `exitFlight`, and `createdById` (null when self-created).
- **Profiles, not raw accounts.** Member lists and activity tags display
  `Profile.displayName`, `@handle`, and `Profile.avatarUrl` per
  [profile model](../../friends/profile-model/README.md) — never exposing
  `User.email` publicly.

## Membership, invites, and join requests

- **Owner and members.** Every group has one `ownerId`. Only the owner can
  rename the group, change visibility settings, approve/reject join requests,
  kick members, transfer ownership, or delete the entire group.
- **Invites.** When `isMemberInviteAllowed` is true, any group member can invite
  another user; otherwise only the owner can. Accepting an invite prompts for
  the invitee's own travel dates (`from`/`to`), leave type, and optional flights
  before creating their `TravelParticipation`.
- **Join requests.** Signed-in non-members viewing a public group can submit a
  `TravelJoinRequest` (`PENDING` → `APPROVED` / `REJECTED`, unique per
  `(groupId, userId)`). Approving creates their participation in the group.
- **Leaving and kicking.**
  - When a member leaves or is kicked, their participation is deleted, their
    uploaded group/activity media is removed (and queued in `STORAGE_DELETE`),
    and include-mode activities where they were the _only_ tagged person are
    deleted (while multi-person activities simply drop them from
    `involvedPeople`).
  - If the owner leaves while other members remain, ownership automatically
    transfers to the second-oldest member (by `participation.createdAt`), who
    receives a `TRAVEL_GROUP_PROMOTION` notification.
  - If the last member leaves, the entire group (activities, media, join
    requests) is deleted and its storage keys are queued for cleanup.

## Visibility and public sharing

A group exposes four independent flags (all default to conservative values:
`isPublic = false`, sub-visibilities `true` when public):

- `isPublic` — whether non-members and signed-out viewers can open the plan.
- `isActivityPublicVisible` — whether the activity timeline and arrival/departure
  cards are shown to non-members.
- `isMemberListPublicVisible` — whether the member list is shown to non-members.
- `isMediaPublicVisible` — whether the photo gallery is shown to non-members.

Public plans have a compact share card at `/share/p/:id` showing the event
hero, plan name, sharer, dates, day count, location, and traveller count with a
link to the full plan. Because `apps/travel` is a Vite SPA, a Cloudflare Pages
Function intercepts `/share/p/:id` (fetching `GET /travel/participations/:id/share`
from `apps/api`) to inject OpenGraph and Twitter Card meta tags into the HTML
shell so Discord, Telegram, and other clients render rich link previews; the
React route hydrates the interactive card normally. This Pages Function pattern
is designed to be reusable for other Vite SPA apps in the workspace.

## Activity timeline

- **Activities.** Each `TravelActivity` belongs to a group and has `name`,
  `from`, `to`, optional `placeId` (linking to a `TravelPlace` from the food
  catalog so diners can jump straight to dishes and maps), optional freeform
  `location` and `mapsUrl`, `involvedPeople` (`String[]` of user IDs),
  `isExcludeMode` (when true, `involvedPeople` lists excluded members instead of
  included ones), `note`, and an optional cover `imageKey`.
- **Synthetic timeline entries.** The timeline merges real activities with:
  1. Per-participant arrival (`from` + `entryFlight`) and departure (`to` +
     `exitFlight`) cards for everyone with `isAlreadyHere = false`. Arrivals or
     departures at the exact same timestamp are merged into a single card. Owners
     and the participant themselves can edit dates and flight numbers inline.
  2. Event start and end boundary markers when the group is linked to an event,
     toggleable via `?markers=0`.
- **Filtering and overview.** The timeline supports text search (name, location,
  note, member name), member filtering (respecting `isExcludeMode`), and
  ascending/descending sort. The overview tab shows an **Upcoming** widget (the
  next 5 future entries across activities, arrivals/departures, and event
  boundaries) that jumps to and highlights the target card on the timeline tab.

## Media galleries

```text
travel/groups/<groupId>/<uuid>.<ext>
travel/activities/<activityId>/<uuid>.<ext>
```

Both group-level photos (`TravelGroupImage`) and per-activity photos
(`TravelActivityMedia`) use the shared two-step upload flow, generate 512px
thumbnails and 2048px previews via `ProcessQueue`, and render in a unified
gallery view with activity/uploader filters and a lightbox. Uploaders and the
group owner can delete photos; deletions enqueue `STORAGE_DELETE`.

## Notifications

Travel reuses the shared `Notification` table (`scope = AppScope.TRAVEL`) and
adds travel `NotificationType` values:

- `TRAVEL_JOIN_REQUEST`, `TRAVEL_JOIN_REQUEST_APPROVED`,
  `TRAVEL_JOIN_REQUEST_REJECTED`
- `TRAVEL_INVITED_TO_JOIN`, `TRAVEL_INVITE_ACCEPTED`, `TRAVEL_INVITE_DECLINED`
- `TRAVEL_OWNERSHIP_TRANSFERRED`, `TRAVEL_GROUP_PROMOTION`
- `TRAVEL_USER_KICKED`, `TRAVEL_USER_LEFT`
- `TRAVEL_EVENT_DELETED`, `TRAVEL_PLAN_DELETED`

Because `Notification` enforces `@@unique([recipientId, type, subjectId])`,
repeatable travel actions (such as inviting, kicking, or leaving the same group
more than once) use a per-occurrence `subjectId` (e.g. the invite/request id or
a generated cuid) while storing `{ groupId, participationId, eventId }` in
`data`.
