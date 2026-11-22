# Travel food catalog

travel.hatohui.com starts as a food catalog: a list of dishes worth the trip and
where to eat them. It replaces a spreadsheet with the columns No, Image, Food,
Cuisine, Location, spicy, vegetarian, Estimate and Note.

## Model

```text
TravelCountry ──< TravelArea ──< TravelPlace >──< TravelPlaceCategory
      │               │                │
      └──>──< TravelCuisine >┘          │
TravelFoodCategory >──< TravelDish ──< TravelRecommendation >──┘
                            │          │        │
                            │          │        └──< TravelRecommendationImage (ordered)
                            └────< TravelCuisine
                                       └──< TravelTag (allergen / special / general)
```

- **A dish belongs to many places, and a place serves many dishes.** The
  spreadsheet row is neither a dish nor a place: it is the pairing, so it gets
  its own table, `TravelRecommendation`, unique on `(placeId, dishId)`.
- **Everything that differs per place lives on the recommendation:** the note,
  the price, the photos, and the tags (special, allergen, general). A
  vegetarian restaurant's version of a dish is vegetarian even when the dish
  usually is not, so none of those can sit on the dish.
- **Food categories and place categories are master-data tables**, both
  many-to-many with dishes and places respectively (`TravelFoodCategory` with
  `TravelDish`, `TravelPlaceCategory` with `TravelPlace`). A dish such as Egg
  Coffee or Vietnamese Coffee can belong to "Coffee", while a place can belong
  to multiple dining styles at once (for example, both "Buffet" and "Self-pick
  meals"). Names are unique and matched case-insensitively across inline tag
  creation and `/travel/food-categories` / `/travel/place-categories` admin
  endpoints.
- **Cuisines are their own table**, many-to-many with dishes, so a dish can be
  both "Vietnamese" and "Street food" and the catalog can filter and suggest by
  them. Names are unique and matched case-insensitively, so typing an existing
  cuisine reuses it.
- **Tags are allergens, specials, or general.** Allergens the dish _contains_
  (peanuts, tree nuts, shellfish, fish, egg, dairy, gluten, soy, sesame) are
  seeded `TravelTag` rows with fixed keys so each language translates them;
  special tags (`spicy`, `vegetarian`, `michelin`, plus custom tags added via
  Admin or the food editor) carry standout attributes and support tri-state
  include/exclude filtering (`tags` / `excludeTags`); general tags (bread,
  noodles) are free-form. Allergen filters hide any dish containing one of
  them. (`travel_special_tags` replaced the earlier `spicy` and `vegetarian`
  booleans with `TravelTagKind.SPECIAL`.)
- **Cuisines carry the culture.** A cuisine can belong to one or more countries
  ("Vietnamese" → Vietnam; "East and Southeast Asian" → Vietnam, Japan, Thailand…)
  or a specific area, which includes its country. Styles like "Cafe" belong to
  none. A dish gets its places in the world through its cuisines, so it is
  never duplicated per country.
- **A place's location is its area.** The free-text `city` column was removed;
  `travel_catalog_cleanup` matched it to an area by name and otherwise kept it
  in `address`. The forms require an area whenever areas exist.
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
`estimate` became a one-value range, and `vegetarian` became the vegetarian
diet tag.

## Browsing

One route (`/`) answers both questions people bring: "where can I get this
dish?" and "what is good at this place?". A `By dish | By place` switch, kept in
`?view=`, swaps the grid; the old `/dishes` and `/places` list routes redirect
there. Recommendations are not listed on their own: they are the rows on a dish
or place detail page.

- **Both views take the same filters.** `GET /travel/places` and
  `GET /travel/dishes` accept `tags`, `excludeTags`, `cuisines`,
  `foodCategories`, `placeCategories`, and `excludeAllergens`. Filtering by a
  dish or place category works across both `By dish` and `By place` views (a
  place matches food filters when at least one recommendation serves matching
  food; a dish matches `placeCategories` when at least one recommendation is at
  a matching place). For places, an allergen filter hides only the matching
  dishes, not the whole place.
- **Catalog results can be grouped by category** via `?group=category`. Each
  category renders as its own section, with multi-category dishes or places
  appearing under every matching category group (filtered to active category
  selections when category filters are active) and uncategorized items placed
  last.
- **By dish is also a food dictionary.** With a country picked, the list
  holds dishes whose cuisines belong to that country plus any dish served
  there, so dishes with no place yet still show. With an area picked, it is
  the area's own cuisines, its country's country-wide cuisines, and anything
  served in the area. The location sorts and labels instead of filtering:
  `localPlaceCount` counts places in the picked area or country, dishes found
  there come first, and the rest read "No recommended spots". Special and tag
  filters stay pick-based, since attributes like spicy, vegetarian, or Michelin
  depend on how a place makes the dish.
- **Dish and place suggestions are searched on the server** as you type
  (`?q=`), so the form never preloads the whole catalog.

## Personal allergies

A signed-in user can save the allergens they avoid (`GET/PUT
/travel/allergies`, a many-to-many between `User` and allergen `TravelTag`
rows). Dish and place list items carry `allergens`, the union of allergen tags
across their recommendations. Cards whose allergens overlap the user's get a
warning ring and a "Contains …" badge, and a "Hide my allergens" filter adds
the saved list to `excludeAllergens`.

## Writes

Only users with the `admin` role can write (`AdminRoleGuard`: session plus role,
no admin key, since the travel app has no key to send). Reads are public.

`POST /travel/recommendations` accepts `dishId` or `dishName` (+ `cuisines`,
`foodCategories`) and `placeId` or `place` (`name`, `mapsUrl`, `areaId`,
`categories`), so one form submission can add a whole spreadsheet row, creating
the dish, place, and category links on the way.

## Photos

```text
travel/recommendations/<recommendationId>/<uuid>.<ext>
```

Uploads use the shared two-step flow (signed into `uploads/<userId>/`, then
relocated when saved; see [storage layout](../../art/storage-layout/README.md)).
`imageKeys` is the full ordered list: staged keys are moved in, known keys are
kept, and anything left out is deleted. The first image is the cover.

## Locations

A place stores a Google Maps link plus `latitude`/`longitude`. There is no
Google Maps Platform key: the link is the only input, and maps are shown with
Google's keyless embed (`maps.google.com/maps?q=…&output=embed`), so nothing is
billed.

- **Coordinates come from the link.** The exact pin (`!3d…!4d…`) wins over the
  map viewport (`@lat,lng`), then `?q=lat,lng`. Short share links
  (`maps.app.goo.gl`) carry none, so the API follows their redirects to the full
  URL first. It only ever requests `goo.gl` hosts over https and stops at the
  first hop outside `goo.gl`/`google.*`, so the endpoint can't be used to fetch
  arbitrary URLs; it times out after 5 seconds and falls back to no
  coordinates.
- **Changing the link re-reads the coordinates**, and clears them when the new
  link has none, so a place never keeps the pin of a link it no longer has.
- **The form previews the link** through `POST /travel/places/link-preview`
  (admin only), which returns the coordinates and the place name from the
  link. The preview falls back to searching the typed place name, and offers
  the link's name when it differs from what was typed.

The coordinates also exist so a later trip planner (including an AI one) can
group and order places by distance.
