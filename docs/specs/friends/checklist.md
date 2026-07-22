# @friends — Discovery Checklist

Decisions confirmed during discovery. This is not a prioritization/MVP cut list —
see `PRD.md` for the full user stories. Use this as the starting checklist for the
implementation spec.

## Scope & architecture

- [x] Frontend lives in `apps/friends` (Vite + react-router SPA), deployed at
      `friends.hatohui.com`.
- [x] Backend reuses `apps/api` (NestJS) — no separate backend app. New `friends`
      and `auth` modules to be added there.
- [x] OAuth is backend-driven: NestJS + Passport (`passport-google-oauth20`),
      redirect-based flow, backend owns tokens (including Calendar scope).
- [x] Avatar storage: S3-compatible client (`@aws-sdk/client-s3`) against MinIO now,
      env-config swap to Cloudflare R2 later — no MinIO-specific SDK.

## User stories (all confirmed, see PRD.md for full AC)

- [x] US1 — Whitelisted Owner Authentication
- [x] US2 — Friend Profile Creation & Management (incl. avatar upload)
- [x] US3 — Upcoming Birthdays Dashboard
- [x] US4 — Google Calendar Event Sync

## External integrations confirmed

- [x] Google OAuth (login) + Google Calendar API (event push) — via `apps/api`.
- [x] MinIO (existing `docker-compose.yml` service, not yet used by any app) for
      avatar uploads, with env vars shaped for a future R2 swap.
- [x] No other external integrations for this MVP (no email/push notifications, no
      other storage).

## Open items for the implementation spec (not decided here)

- [ ] Exact session mechanism (signed cookie vs JWT) for `apps/api`.
- [ ] Prisma schema for `Friend` (and `Session`, if persisted server-side).
- [ ] MinIO bucket name/creation (not currently defined in `docker-compose.yml`) and
      whether `STORAGE_FORCE_PATH_STYLE`/bucket setup needs a compose change.
- [ ] `apps/friends` page structure (`pages/`, routes) and component breakdown.
- [ ] OpenAPI operationIds for the new `auth` and `friends` endpoints.
