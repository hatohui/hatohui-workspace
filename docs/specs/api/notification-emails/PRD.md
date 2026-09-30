# Notification emails

When a `Notification` row is written for someone, they also get an email about
it. Two delivery paths, one guaranteed and one fast:

- **Fast path** — right after the notification's transaction commits, the
  caller calls `NotificationsService.flushEmail()`, which tries to send
  immediately. Under quota, the email goes out and the queue row is deleted.
- **Guaranteed path** — `NotificationsService.emit()` writes a
  `ProcessQueue` row (`type = NOTIFICATION_EMAIL`, `refId = notification.id`)
  inside the same transaction as the notification. The existing
  `/cron/queue/process` schedule (every 15 min) drains it through
  `NotificationEmailExecutor`. Nothing is lost if the fast path never runs or
  fails.

## "No usage left" is reactive

There is no pre-send capacity check and no configurable daily cap. Every
attempt calls Brevo. The service only treats capacity as exhausted when the
provider rejects the send with a rate-limit / quota error (`isRateLimitError`,
HTTP 429). On that signal `deliver()` returns `'queued'`:

- fast path: leaves the `ProcessQueue` row for the cron.
- cron path: the executor throws, so `ProcessQueueRunnerService` applies its
  normal exponential backoff (5 min base, capped at 6 h) and retries later.

Any other provider error propagates: the fast path swallows it and leaves the
row queued; the cron path counts it as a failed attempt and backs off.

## What gets an email

`EMAILED_NOTIFICATION_TYPES` in `notifications.constants.ts`:

| Type                 | Emailed? | Why                                            |
| -------------------- | -------- | ---------------------------------------------- |
| `CONNECTION_REQUEST` | yes      |                                                |
| `CONNECTION_ACCEPTED`| yes      |                                                |
| `SYSTEM`             | yes      | copy comes from `notification.data` title/body/url |
| `*_BY_YOU`           | no       | self-history; `emit()` gets `read: true` and skips the queue row |
| `CONNECTION_REJECTED`| no       | a "they declined you" email is not worth sending |
| `BIRTHDAY_REMINDER`  | no       | never goes through `emit()` — already emailed via `EmailOutbox` |

`emit()` only writes the queue row when `!input.read` and the type is in the
set, so muted types cost nothing.

## Dedupe

`Notification.emailedAt` is stamped on a successful send. `deliver()` returns
`'skipped'` if it is already set, so the fast path and the cron path can never
both send, and a re-`emit()` of the same `(recipient, type, subject)` triple
does not re-email.

## Opt-out

`UserSetting` `(userId, 'friends.notifications.emailenabled', FRIENDS)`. Absent
row = enabled. Only the literal value `'false'` disables it. No endpoint ships
with this feature; the setting is read if present.

## Stale drop

`NotificationEmailExecutor` drops a queued job whose `Notification.createdAt`
is older than `NOTIFICATION_EMAIL_MAX_AGE_MS` (3 days). The in-app notification
still stands; a days-late email is noise, and this bounds queue growth if the
sender is never configured.

## Operator setup

Sender identity is two `SystemParameters` rows, `FRIENDS` scope:

- `friends.notifications.senderemail`
- `friends.notifications.sendername`

Both are seeded by `seedCore` (`prisma/seeds/core/system-parameters.ts`) with
the same values the birthday sender uses, so a fresh `task db:seed` /
`task db:prod:seed` provisions them. The seed upserts with `update: {}`, so an
admin override through the system-parameters UI is never clobbered. If both are
somehow missing, `deliver()` logs a warning and returns `'queued'` — nothing
sends and the queue ages out after 3 days. `EMAIL_API_KEY` (Brevo) is already
wired.

## Not done here

- No new env vars, Doppler secrets, or Terraform. The `/cron/queue/process`
  EventBridge schedule already exists.
- No frontend. The opt-out has no settings UI yet.
- The email HTML skeleton in `utils/notification-email-templates.ts` is a copy
  of the birthday email layout. If a third email surface appears, extract a
  shared `common/utils/email-layout.ts`.
