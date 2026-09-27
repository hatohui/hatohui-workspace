# Order a commission — checklist

Read [prd.md](./prd.md) first. Flow: [`../flows/order-a-commission.bpmn`](../flows/order-a-commission.bpmn).

## Schema

- [x] `Client.profileId` → `Profile` (nullable, not unique, `SetNull`)
- [x] `CommissionDetail.contactPlatform` / `contactValue` snapshot
- [x] Migration `20260928120000_client_profile_and_contact_snapshot` — written
      idempotent (`IF NOT EXISTS`, guarded FK), backfills `profileId` from
      linked accounts and the snapshot from `Client`'s legacy contact columns
- [x] Applied locally
- [ ] Applied to production (`db-migrate-cd.yml` on merge)

## Backend

- [x] `POST /clients/identity-match` (`matchCommissionIdentity`)
- [x] `GET /clients/me/identity` (`myCommissionIdentity`)
- [x] `ClientIdentityService.resolve` replaces `resolveAccountClient` /
      `requireClientIdentity` in `CommissionsService.submit`
- [x] `SubmitCommissionDto`: `clientHandle`, `matchedProfileId`,
      `contactPlatform`, `contactValue` (legacy `preferredContactMethod` /
      `contactHandle` still accepted)
- [x] `CommissionDto.contactPlatform` / `contactValue`
- [x] `IdentityClaimService.claimFor` on every Google login (not exercised:
      needs a real Google sign-in)
- [x] Public submit rejects with 403 when the artist has no `OPEN` opening —
      the commission-open PRD's "closing stops new public submissions", which
      the API never enforced
- [x] `tsc` + `eslint` clean
- [x] OpenAPI + Orval client regenerated

## Frontend (`apps/art`)

- [x] Handle field; silent debounced match; "Is this you?" card only when a
      match exists
- [x] Contact picker: existing contacts from the identity, email, or a new one
- [x] Form order follows the flow: identity → type → idea/deadline → contact
- [x] i18n: en / ja / vi / zh
- [x] `tsc` + `eslint` clean
- [x] Browser walkthrough (anonymous): silent match on handle, confirm,
      identity's contacts offered in the picker, submit linked to the matched
      profile without renaming it. Curl: new identity, duplicate handle
      (`luketest_2`), unclaimed-profile contact append, missing contact value
      400, closed window 403

## Follow-ups

- Artist-side screens (`AcceptedSlotsTable`, client panel, request panel)
  still read `Client.preferredContactMethod` / `contactHandle`; switch them to
  the per-commission snapshot, then drop the legacy columns.
- `GET /clients/lookup?email=` predates this flow and is now unused by the
  form.
