# Birthday notifications

Email reminders for upcoming and same-day birthdays, driven by AWS EventBridge
Scheduler calling cron endpoints on `apps/api` over HTTPS, with the admin key
sent as a header via an EventBridge API destination.

## What gets sent, to whom

Three kinds, all keyed off a `Birthday` row whose `Profile` is claimed by a
registered `User` (the **owner**). Unclaimed directory entries have no account,
no connections and no mailbox, so they produce nothing.

| Kind                       | Recipients                          | When                    |
| -------------------------- | ----------------------------------- | ----------------------- |
| `FRIEND_BIRTHDAY_UPCOMING` | the owner's `ACCEPTED` connections  | `reminderDays` before   |
| `FRIEND_BIRTHDAY_TODAY`    | the owner's `ACCEPTED` connections  | on the day              |
| `SELF_BIRTHDAY`            | the owner                           | on the day              |

Connections are the audience because an accepted connection is this app's
definition of "these two people know each other" — a reminder is only welcome
from someone you actually asked to be connected to.

## Timezones

"Today" is resolved against **the birthday owner's** `User.timezone`, not the
server's and not the reader's. The claim "it's their birthday today" is a fact
about the person having the birthday, so it has to be computed in their zone or
it is wrong for up to a day at the edges.

That is also why the evaluate pass runs hourly rather than daily: a single
daily run at a fixed UTC hour lands on a different local time in every zone, so
there is no one hour at which "is it their birthday today?" is correct for
everyone. Hourly polling makes each zone's midnight get picked up within the
hour.

The owner's zone and their local date are passed into the email as render
params, so the copy can say *whose* today it is instead of assuming the reader
shares it.

`User.timezone` is an IANA zone name, captured during onboarding: detected from
the browser via `Intl.DateTimeFormat().resolvedOptions().timeZone`, then shown
in an editable picker — same "autofill, then let them correct it" shape as the
name and avatar steps.

## Why an outbox table

Deciding *what* to send and actually *sending* it are separate passes against
`EmailOutbox`. The queue is what makes the failure modes cheap:

- **Provider down or daily quota hit** — rows stay `PENDING`, the next pass
  drains them. Nothing is lost and nothing is re-derived.
- **Function dies mid-batch** — claimed rows are visibly stuck in `SENDING`
  rather than silently dropped.
- **Cron fires twice** — see idempotency below.

## Idempotency

Two independent mechanisms, one per pass.

**Enqueue** is guarded by `@@unique([kind, recipientId, subjectId, occursOn])`.
The evaluate pass re-derives the same rows every hour on the day and writes
them with `skipDuplicates: true`, so all but the first write are no-ops. This
is what makes hourly evaluation cheap: no extra sends, no duplicate rows, just
a cheap query. `occursOn` is part of the key so next year's birthday is a
distinct row rather than a collision with this year's.

**Send** claims a batch in a single statement with `FOR UPDATE SKIP LOCKED`,
flipping `PENDING` → `SENDING` before any mail leaves. A concurrent or retried
invocation skips locked rows instead of grabbing them, so no row is sent twice
even if two process passes overlap.

## Failure isolation

A per-row failure (bad address, rejected template) marks that row `FAILED` with
`lastError`, increments `attempts`, and the loop moves on — one bad address
must not strand the rest of the batch.

A rate-limit response is the exception: it means the provider will reject
everything that follows, so the pass stops, returns the rest of its claimed
batch to `PENDING`, and lets the next run pick them up.

## Retention

Cleanup deletes `SENT` rows older than 7 days — long enough to answer "did my
reminder go out?", short enough that the table stays trivial.

## Configuration

Tunables live in `AppConfig` (scope `FRIENDS`) rather than env vars, so they
change without a redeploy:

| `type`                          | Meaning                                       |
| -------------------------------- | ---------------------------------------------- |
| `friends.birthday.reminderdays`  | how many days ahead the upcoming reminder is   |
| `friends.birthday.dailysendcap`  | max emails sent per UTC day across all passes  |
| `friends.birthday.senderemail`   | the `from` address on outgoing reminders       |
| `friends.birthday.sendername`    | the `from` display name                        |

The cap exists because the mail provider's free tier is finite; it is a daily
budget shared by every process pass that day, not a per-invocation limit. If
the sender pair is unset, `process` logs a warning and sends nothing rather
than guessing an address.

## Email content

Reminders are rendered as HTML in `birthday-email-templates.ts` rather than
referencing a Brevo dashboard template by id — one function per
`EmailOutboxKind`, sharing a single inline-styled layout so a color or spacing
change is one edit instead of three dashboard templates kept in sync by hand.
Sent via Brevo's `sendTransacEmail` with `htmlContent`/`subject` directly
instead of `templateId`. User-derived strings (names, handles, dates) are
HTML-escaped once, inside the shared layout function, rather than at each call
site.

## Scheduling

`infra/modules/scheduler` provisions three `aws_scheduler_schedule` resources
— evaluate hourly, process hourly (a few minutes after evaluate, so a reminder
queued this hour goes out in the same hour), cleanup daily — each targeting an
`aws_cloudwatch_event_api_destination` that POSTs to the corresponding
`/cron/friends/birthdays/*` route on the deployed API. A single
`aws_cloudwatch_event_connection` (`API_KEY` auth) attaches the `x-admin-key`
header to every invocation; the secret backing it is Doppler's
`ADMIN_API_KEY`, wired through `module.secrets.admin_api_key`, not entered by
hand in a third-party dashboard.

Cron routes authenticate with the `ADMIN_API_KEY` header alone — `AdminGuard`'s
session requirement can't be satisfied by a scheduled call, so `CronGuard`
checks the header (timing-safe) and nothing else.
