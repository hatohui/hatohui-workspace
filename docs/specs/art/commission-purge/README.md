# Commission purge after completion

A `COMPLETED` commission is scrubbed after a per-artist retention window
(`art.commission.retentiondays`, default 30 days, 1-365). Cancelled and declined
commissions are not purged yet.

## Scheduling

- `CommissionsService.updateStatus` to `COMPLETED` schedules a `COMMISSION_PURGE`
  process-queue job at now + retention; leaving `COMPLETED` cancels it.
- Retention changes apply to commissions completed afterwards, not to jobs
  already queued.
- The `commission_purge_backfill` migration queues existing completed
  commissions at their completion time + 30 days, not immediately.
- `CommissionPurgeExecutor` runs from `POST /cron/queue/process`; failures retry
  with the normal backoff. It no-ops if the commission is gone, already purged,
  or no longer `COMPLETED`.

## Kept

- `Client` (customer details).
- `Commission` row and `CommissionStatusHistory` (the log) - history `note`s are
  nulled because they can carry conversation.
- `CommissionDetail`: type, option key, add-on keys, currency, quote, payment
  status, `referenceAssets`.
- Result images: final progress images become `Asset`s with `commissionId`,
  tagged with the type tag plus option and add-on keys. `isPrivate` is set from
  `Commission.allowGalleryPost`, so refusals stay out of the public gallery.

## Removed

- Comments and progress entries (messages, timeline), and the storage objects
  only they referenced (via `CommissionAttachmentsService.release`).
- `idea`, deadline, contact platform/value, every step timestamp, estimate,
  original quote, quote-sent time, priority.
- Passcode. The `accessCode` is rotated, so old client links 404.

`purgedAt` marks the result; status changes on a purged commission are rejected.

## Gallery consent and private fee

- `allowGalleryPost` is set on the order form, on artist-created commissions,
  and per queue item (`PATCH` visibility). New orders default to
  `art.commission.gallerypostdefault`.
- `art.commission.privatefee` is added to the estimate only when
  `allowGalleryPost` is false at submission. Later toggles never touch `quote`,
  which only changes through `updateQuote`.

## Known gaps

- Storage release runs after the purge transaction; a crash between them leaves
  orphaned objects (no retry, since `purgedAt` is set).
- Frontend: only the settings form is wired. The order-form checkbox, workspace
  toggle and queue-item toggle still need UI.
