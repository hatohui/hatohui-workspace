# Travel food catalog

travel.hatohui.com starts as a food catalog: a list of dishes worth the trip and
where to eat them. It replaces a spreadsheet with the columns No, Image, Food,
Cuisine, Location, spicy, vegetarian, Estimate and Note.

## Model

```text
TravelDish ──< TravelRecommendation >── TravelPlace
                     │
                     └──< TravelRecommendationImage (ordered)
```

- **A dish belongs to many places, and a place serves many dishes.** The
  spreadsheet row is neither a dish nor a place: it is the pairing, so it gets
  its own table, `TravelRecommendation`, unique on `(placeId, dishId)`.
- **Everything that differs per place lives on the recommendation:** the note,
  the price estimate and currency, the photos, and the spicy and vegetarian
  tags. A vegetarian restaurant's version of a dish is vegetarian even when the
  dish usually is not, so those tags can't sit on the dish.
- **Dish names are unique** (matched case-insensitively), so typing an existing
  name reuses the dish. Place names are not unique (chains, same name in
  another city), so a place is reused only when picked by id. The form matches
  exact names client-side so a re-typed place still links up.
- **Creators are recorded on every row**: dish, place, recommendation, and each
  image (`createdById`, set null if the account is deleted). Re-ordering or
  replacing photos keeps each surviving image's original uploader.
- **Deleting a dish or place cascades** to its recommendations and their images,
  and the stored objects are removed after the database delete succeeds.

## Writes

Only users with the `admin` role can write (`AdminRoleGuard`: session plus role,
no admin key, since the travel app has no key to send). Reads are public.

`POST /travel/recommendations` accepts `dishId` or `dishName` (+ `cuisine`) and
`placeId` or `placeName` (+ `placeMapsUrl`), so one form submission can add a
whole spreadsheet row, creating the dish and place on the way.

## Photos

```text
travel/recommendations/<recommendationId>/<uuid>.<ext>
```

Uploads use the shared two-step flow (signed into `uploads/<userId>/`, then
relocated when saved; see [storage layout](../../art/storage-layout/README.md)).
`imageKeys` is the full ordered list: staged keys are moved in, known keys are
kept, and anything left out is deleted. The first image is the cover.

## Locations

A place stores a Google Maps link plus `latitude`/`longitude`. Coordinates are
read from the link when it contains them (`@lat,lng`, `!3d…!4d…`, `?q=lat,lng`);
short `maps.app.goo.gl` links don't contain them and are left without
coordinates. The coordinates exist so a later trip planner (including an AI
one) can group and order places by distance.
