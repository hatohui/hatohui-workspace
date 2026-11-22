# Travel events

Events represent conventions, furmeets, and community gatherings that travel
plans can attach to. They are ported from `hatocon` into `apps/travel` and
integrate with the existing location model.

## Model

```text
TravelArea ──< TravelEvent ──< TravelEventInvitee
                   │
                   ├──< TravelParticipationGroup
                   └──< TravelParticipation
```

- **Visibility and approval.** `visibility` is `PUBLIC` or `PRIVATE`.
  - `PRIVATE` events are auto-approved on creation (`isApproved = true`) and are
    visible only to their creator, listed invitees (`TravelEventInvitee`), and
    users who have a participation in the event.
  - `PUBLIC` events created by a travel editor (`TravelEditorGuard`) are
    auto-approved; ones created by regular signed-in users start with
    `isApproved = false` and appear only to their creator and admins until
    approved in `/admin`.
- **Recurrence.** `isYearly` marks annual conventions so calendar and timeline
  views can badge or project recurring events without duplicating rows.
- **Locations.** An event stores freeform `location` and `mapsUrl`, parsed with
  the same keyless Google Maps coordinate extractor used by `TravelPlace` (see
  [food catalog](../food-catalog/README.md#locations)). It can also optionally
  link to a `TravelArea` (`areaId`) so events filter alongside the header
  location picker, and to a `TravelPlace` (`placeId`) when a venue already
  exists in the catalog.
- **Creators and references.** `createdById` links to `User` (`onDelete: SetNull`
  so deleting an account does not orphan community events). `reference` holds an
  optional external URL (convention site, registration page).
- **Soft vs. hard delete.** Regular event deletion sets `isDeleted = true` and
  `deletedAt`, hiding the event from listings while preserving historical
  participations. Admin hard-delete removes the event, its participations,
  groups, activities, and queues all associated storage keys for deletion via
  `STORAGE_DELETE` before notifying affected participants (`EVENT_DELETED`).

## Photos

```text
travel/events/<eventId>/<uuid>.<ext>
```

Event cover images use the shared two-step presigned upload flow
(`uploads/<userId>/` → relocated on save) and queue `TRAVEL_EVENT_THUMBNAIL` in
`ProcessQueue` for 512px WebP thumbnail and 2048px WebP preview variants, matching
[storage layout](../../art/storage-layout/README.md).

## Views and caching

- **Public reads.** Approved `PUBLIC` events are readable without signing in.
  Signed-in viewers also see their own unapproved submissions and `PRIVATE`
  events they created, were invited to, or participate in.
- **Views.** `/events` offers timeline, calendar, and list views with debounced
  search, date-range filtering, an event detail sheet (synced via `?selected=`),
  and a direct link to the viewer's existing participation if they already have
  one.
- **Caching.** Public event range queries (`GET /travel/events/calendar`) are
  cached in Redis for 10 minutes and invalidated on event create, update, approve,
  or delete.
