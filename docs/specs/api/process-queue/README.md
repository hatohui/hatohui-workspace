# The generic process queue, and why `Asset` thumbnails go through it

`Asset` uploads (the gallery in `apps/art`) needed a server-side thumbnail
pipeline: fetch the original from R2 (or an external URL), downscale it with
`sharp`, upload a `.webp` back, and — critically — retry if any of that fails,
rather than leaving `thumbnailUrl` permanently `null`.

That retry mechanism was built as a **generic process queue**
(`ProcessQueue` model, `apps/api/src/modules/process-queue/`) instead of an
asset-specific job table, because the commission "queue" progress-timeline
feature (`apps/art/src/app/queue/*`) is expected to need the same
fetch-then-process-with-retry shape later (e.g. thumbnailing progress photos).
Building the retry engine generically now means that feature can register its
own `ProcessExecutor` without new queue infrastructure — no new table, no new
cron wiring, just an executor and a registry entry.

## Why `ProcessQueue.refId` has no foreign key

The table is polymorphic across `ProcessType`s that don't share a parent table
(`Asset` today, something else later). A typed FK would force either a nullable
FK per possible referent (growing with every new type) or a shared parent table
that doesn't otherwise need to exist. `refId` is therefore a loose string
reference, and each domain service owns cleaning up its own queue rows —
`AssetsService.remove()` calls `ProcessQueueService.clearForRef(...)` when an
`Asset` is deleted, the same way it deletes the R2 thumbnail object. If a second
`ProcessType` is added later, its owning service takes the same responsibility.

## How dispatch works without circular module imports

- `process-queue` module: owns the `ProcessQueue` table and the `ProcessExecutor`
  interface, but not any executor implementation. `ProcessQueueService` only does
  DB bookkeeping (`enqueueFailure`, `findDue`, `markSucceeded`, `clearForRef`) —
  it has no dependency on `assets` or any other domain module.
- `assets` module: implements `AssetThumbnailExecutor` (a `ProcessExecutor` for
  `ProcessType.ASSET_THUMBNAIL`) and exports it. `AssetsService` calls the
  executor inline at create time (so the common case still gets a thumbnail
  synchronously) and falls back to `ProcessQueueService.enqueueFailure` only if
  that inline attempt throws.
- `cron` module: the only place that knows about the full set of executors. It
  imports `AssetsModule` (for `AssetThumbnailExecutor`) and `ProcessQueueModule`,
  assembles the executor registry via a factory provider, and exposes
  `POST /cron/queue/process` (optionally `?type=`) for the external scheduler to
  call — same `CronGuard` + `ADMIN_KEY_HEADER` pattern as
  `cron/friends/birthdays/*`.

Dependency direction is one-way: `cron` → `assets` + `process-queue`. Neither of
those imports `cron`, so there's no circular module graph.

## Retry cadence

Exponential backoff on failure: base 5 minutes, doubling, capped at 6 hours —
retried indefinitely at the capped interval rather than a hard max-attempt
cutoff, so a persistently-failing job doesn't need a separate admin-recovery UI
to unstick. The external scheduler calls `POST /cron/queue/process` every 15
minutes. Both numbers are plain constants in
`apps/api/src/modules/process-queue/services/process-queue.service.ts` and
`infra/modules/scheduler/main.tf` respectively — tune them there if the queue
ever needs a different cadence per type.
