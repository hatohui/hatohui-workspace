# Single-artist site

`art.hatohui.com` belongs to one artist. This reverses the `/[artist]` routing
chosen in [commission-open](../commission-open/prd.md): public pages live at the
site root (`/`, `/gallery`, `/commission`, `/queue`, `/projects/[id]`,
`/groups/[code]`), and there is no artist picker or first-run setup wizard.

## Which artist

`GET /artist` returns the site artist: the user whose email matches the
`admin.email` system parameter and who has the `artist` role. If no such user
exists, it falls back to the earliest-created artist. In production the owner
always exists, so the fallback only matters for a fresh local database, where
the dev seed's artist then serves the site instead of every page 404ing until
the owner signs in.

The backend stays artist-scoped (`artistId` on commissions, openings, pricing
and so on). Only the frontend's choice of artist changed, so a second artist
could come back later without a data migration.

## Home page

`/` is an animated About page. Its content (headline, intro, Markdown body, fun
facts) is the `art.about` user setting on the site artist, edited at
`/app/about` and served by `GET /artist/about`. Until it is saved, the API
returns lorem ipsum defaults (`ABOUT_DEFAULTS`). Animation runs on GSAP in
`useLandingAnimation` and is skipped entirely under `prefers-reduced-motion`.
