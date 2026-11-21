# Travel food catalog

travel.hatohui.com starts as a food catalog: a list of dishes worth the trip and
where to eat them. It replaces a spreadsheet with the columns No, Image, Food,
Cuisine, Location, spicy, vegetarian, Estimate and Note.

## Model

```text
TravelCuisine >──< TravelDish ──< TravelRecommendation >── TravelPlace
                                       │        │
                                       │        └──< TravelRecommendationImage (ordered)
                                       └──< TravelTag (diet / allergen presets)
```

- **A dish belongs to many places, and a place serves many dishes.** The
  spreadsheet row is neither a dish nor a place: it is the pairing, so it gets
  its own table, `TravelRecommendation`, unique on `(placeId, dishId)`.
- **Everything that differs per place lives on the recommendation:** the note,
  the price, the photos, the spice level and the diet and allergen tags. A
  vegetarian restaurant's version of a dish is vegetarian even when the dish
  usually is not, so none of those can sit on the dish.
- **Cuisines are their own table**, many-to-many with dishes, so a dish can be
  both "Vietnamese" and "Street food" and the catalog can filter and suggest by
  them. Names are unique and matched case-insensitively, so typing an existing
  cuisine reuses it.
- **Tags are split by meaning.** Spice is a single level (`NONE`, `MILD`,
  `MEDIUM`, `HOT`) on the recommendation, not a tag, because a dish has exactly
  one. Diets (vegetarian, vegan, pescatarian, halal, kosher, gluten-free,
  dairy-free) and allergens the dish _contains_ (peanuts, tree nuts, shellfish,
  fish, egg, dairy, gluten, soy, sesame) are rows in `TravelTag` with a `kind`,
  seeded by the migration with fixed keys so each language translates them.
  Diet filters require every selected diet; allergen filters hide any dish
  containing one of them.
- **Price is a range or a level.** `priceMin`/`priceMax` hold an amount range
  (a single price stores min = max); `priceLevel` (`LOW`, `MID`, `HIGH`) is for
  when only a rough level is known. The API normalises a reversed range.
- **Dish names are unique** (matched case-insensitively), so typing an existing
  name reuses the dish. Place names are not unique (chains, same name in
  another city), so a place is reused only when picked by id. The form matches
  exact names client-side so a re-typed place still links up.
- **Creators are recorded on every row**: cuisine, dish, place, recommendation,
  and each image (`createdById`, set null if the account is deleted).
  Re-ordering or replacing photos keeps each surviving image's original
  uploader.
- **Deleting a dish or place cascades** to its recommendations and their images,
  and the stored objects are removed after the database delete succeeds.

The `travel_cuisines_tags_price` migration converted the first version's
columns in place: comma-separated `cuisine` text became cuisine rows, a single
`estimate` became a one-value range, `spicy` became `MEDIUM`, and `vegetarian`
became the vegetarian diet tag.

## Writes

Only users with the `admin` role can write (`AdminRoleGuard`: session plus role,
no admin key, since the travel app has no key to send). Reads are public.

`POST /travel/recommendations` accepts `dishId` or `dishName` (+ `cuisines`) and
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
