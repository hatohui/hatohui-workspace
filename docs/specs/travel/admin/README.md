# Travel admin and locations

## Who can edit

Reads are public. Every travel write route uses `TravelEditorGuard`: a
signed-in user who is either a global admin or listed in the
`travel.admin.emails` system parameter (scope `TRAVEL`, comma, space or
semicolon separated). The list is cached for five minutes and the cache is
cleared whenever the workspace console edits a system parameter, so a change
there takes effect immediately. The app asks `GET /travel/access` whether to
show editing controls; it never infers that from roles itself.

This replaces the global `admin` role check the first version used, so travel
editing can be granted without making someone a workspace admin.

## Master data vs. content

Master data is edited in `/admin` as inline tables (click a cell to edit,
quick-add several comma-separated names at once, one-click delete):
countries, areas, dishes, cuisines and tags. Deleting a row that is still in
use asks first and says what happens to the rows that depend on it; deleting
an unused row does not.

Places are content, not master data. They are created through the add-food
flow (or by pasting Maps links in bulk through the API) by anyone the
parameter allows, and the catalog can be filtered by the `@handle` of whoever
added them.

## Countries and areas

`TravelCountry` → `TravelArea` → `TravelPlace` (place `areaId` is optional).
Area names are unique within a country. Deleting a country deletes its areas;
deleting an area leaves its places in place with no area, so no content is lost
by reorganising locations.

The viewer picks a country and area in the header; the choice is remembered
per browser and every list (food, dishes, places) is filtered to it. New places
created from the add-food form are filed under the picked area. Picking only a
country filters to all of its areas.

## Tags

Diet and allergen tags are rows in `TravelTag` (`key`, `kind`, `name`). The
seeded presets have no `name` and are translated by key in every language;
renaming one in the admin stores a `name`, which then wins over the
translation. Tags added in the admin get a key derived from their name. Saving
food validates every tag key against the table and its kind, so an unknown or
mis-kinded key is a 400, not a database error.

Spicy stays a boolean on the recommendation, not a tag.

## Bulk add

`POST /travel/{countries,areas,dishes,cuisines,tags,places}/bulk` takes a list
of names, skips ones that already exist (case-insensitively, keeping the first
spelling), and returns `{ created, skipped }`. The places endpoint also accepts
Google Maps links: the place is named from the link and gets its pin, and a
link without a place name is skipped.

## Event and plan moderation (planned)

In addition to food-catalog master data, `/admin` hosts moderation tabs for the
travel-planning features (see [events](../events/README.md),
[plans](../plans/README.md), and
[leave & schedule](../leave-and-schedule/README.md)):

- **Events** — review and approve pending `PUBLIC` event submissions, edit any
  event, and soft- or hard-delete events (hard-delete cleans up child groups,
  activities, and stored media, and notifies affected participants).
- **Plans & participations** — searchable, paginated overview of all
  `TravelParticipationGroup`s and participations (by group name, event, or
  member), with admin delete capability.
- **Job profiles & stats** — summary counts (users, pending events, active
  plans) and full admin management of user `TravelJobProfile` records (view,
  create, and edit for any user), complementing self-service editing in
  `/settings/leave`. User account and role management stay in `apps/workspace`,
  not `apps/travel`.
