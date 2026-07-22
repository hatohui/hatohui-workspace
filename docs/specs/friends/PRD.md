# @friends — Personal CRM MVP

## Idea

A private birthday tracker and social-circle CRM for a single owner. Tracks friends'
birthdays, basic profile info, and social handles; surfaces upcoming birthdays
chronologically; and pushes birthdays to the owner's Google Calendar so reminders
show up natively on their phone without opening the app.

## Scope

- **Frontend:** `apps/friends` — a new Vite + react-router SPA, built per the React
  app conventions in `docs/conventions.md` (`pages/`, `hooks/`, `components/`,
  `constants/`). Currently an empty scaffold (`apps/friends/.gitkeep`).
- **Backend:** reuses the existing `apps/api` NestJS app. A new `friends` resource
  module is added under `apps/api/src/modules/friends/` (dto, controller, service,
  module) following the standard layout, plus a new `auth` module for Google OAuth.
  New Prisma models for `Friend` and (if session persistence is needed) `Session`.
- **Deployment target:** `friends.hatohui.com` (frontend). Backend continues to be
  served by `apps/api`'s existing deployment.
- **Out of scope for this discovery doc:** prioritization/MVP cuts, detailed API
  contracts, DB schema, and UI layout — those belong to the implementation spec.

## Key architecture decisions

- **OAuth flow: backend-driven (NestJS + Passport).** `apps/api` gets a
  `passport-google-oauth20` strategy. Login is a redirect-based flow: the SPA sends
  the owner to a `apps/api` login endpoint, which redirects to Google, handles the
  callback, verifies the email against a single whitelisted address, creates a
  session, and redirects back to `apps/friends`. The backend owns the full token
  lifecycle, including the Google Calendar scope grant and refresh tokens — the SPA
  never handles Google tokens directly.
- **Avatar storage: MinIO now, Cloudflare R2 later.** Both are S3-compatible, so
  `apps/api` should use the AWS S3 SDK (`@aws-sdk/client-s3`) against MinIO's S3 API
  (already running via root `docker-compose.yml`, port 9000) rather than a
  MinIO-specific client. Config should be env-driven so swapping to R2 later is a
  config change, not a code change (see Env vars below).
- **No existing auth/session/storage code anywhere in the repo** — this is greenfield
  for both concerns; nothing to reuse beyond the running MinIO container itself.

## User stories

### US 1 — Whitelisted Owner Authentication

As the system owner, I want to authenticate via Google OAuth and restrict access
exclusively to my personal email address, so that my friends' private data is
completely protected from unauthorized viewing or search engine indexing.

- **AC1 (Successful login):** Given I am on the login screen, when I authenticate
  using the explicitly whitelisted Google email address, then a secure session is
  created and I am redirected to the dashboard.
- **AC2 (Rejected login):** Given I am on the login screen, when I authenticate
  using any non-whitelisted email address, then the login is rejected, no session
  is created, and an "Access Denied" message is displayed.
- **AC3 (Protected routes):** Given I am an unauthenticated user, when I attempt to
  navigate directly to the dashboard or a friend's profile URL, then I am
  immediately redirected back to the login screen.

### US 2 — Friend Profile Creation & Management

As the system owner, I want to add a friend with their name, birthday, flexible
social media handles, avatar image, and a privacy flag, so that I have a
centralized, easily updatable digital rolodex.

- **AC1 (Core data entry):** Given I am on the "Add Friend" form, when I input a
  name (required) and a birthday (optional), then the record is successfully
  created in the database.
- **AC2 (Dynamic socials):** Given I am on the friend form, when I add custom
  key-value pairs for social media (e.g. Platform: "Twitter", Handle: "@username"),
  then the frontend serializes this into a JSON object and saves it in the
  `socialMedias` database column.
- **AC3 (Privacy flag toggle):** Given I am creating or editing a friend, when I
  toggle the "Prefer Anonymous" setting, then the boolean is saved to the database
  (defaulting to `true`).
- **AC4 (Avatar upload):** Given I am creating or editing a friend, when I upload an
  image, then the backend stores it via the S3-compatible object storage client
  (MinIO today, R2-ready) and persists the resulting object URL/key on the friend
  record.

### US 3 — Upcoming Birthdays Dashboard

As the system owner, I want to view a list of upcoming birthdays sorted
chronologically from today forward, so that I know exactly who to congratulate and
when.

- **AC1 (Chronological sorting):** Given I navigate to the dashboard, when the page
  loads, then the list displays friends sorted by whose birthday is next occurring
  in the current calendar year.
- **AC2 (Age calculation):** Given a friend's profile includes a full date of birth
  (including the year), when they appear on the dashboard, then the UI displays the
  age they are turning (e.g. "Turning 28").
- **AC3 (Missing year graceful degradation):** Given a friend's profile only
  includes a month and day (no birth year), when they appear on the dashboard, then
  the UI just shows the date without attempting to calculate an age.

### US 4 — Google Calendar Event Sync

As the system owner, I want to automatically push a friend's birthday to my
personal Google Calendar, so that I receive native system notifications on my phone
without needing to open the web app.

- **AC1 (Event creation):** Given I create a new friend with a `birthDate`, when the
  profile is saved, then the backend pushes an annual recurring, all-day event
  (e.g. "🎂 [Name]'s Birthday") to Google Calendar and stores the returned
  `gcalEventId`.
- **AC2 (Event updating):** Given I update the name or birthday of an existing
  friend, when the changes are saved, then the backend uses the stored
  `gcalEventId` to patch the existing Google Calendar event rather than creating a
  duplicate.
- **AC3 (Calendar API permissions):** Given I am authenticating for the first time,
  when I complete the backend Google OAuth flow (Passport, `apps/api`), then I am
  prompted to grant Google Calendar scopes so the backend can acquire the necessary
  access tokens.

## External integrations & env vars to prepare

- **Google OAuth + Calendar API:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_OAUTH_CALLBACK_URL`, `OWNER_WHITELISTED_EMAIL` (backend, `apps/api`).
- **Object storage (MinIO now, R2-ready later):** generic S3-shaped vars so the
  backend client only needs a config swap, not a code change —
  `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID`,
  `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_FORCE_PATH_STYLE` (true for MinIO, false for
  R2). Local dev points these at the existing `docker-compose.yml` MinIO service
  (`localhost:9000`, currently `root`/`root` credentials — not yet parameterized via
  env anywhere in the repo).
- **Session:** a session-signing secret (e.g. `SESSION_SECRET`) for `apps/api`,
  exact mechanism (cookie session vs JWT) left to the implementation spec.

All new vars must be declared in `apps/api/src/config/env.ts`'s zod schema per
`docs/conventions.md`, and mirrored in `apps/api/.env.example`.
