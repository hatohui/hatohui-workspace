# Birthday notifications — implementation checklist

See [PRD.md](./PRD.md) for the reasoning behind each decision.

## Schema

- [x] `User.timezone` (IANA name, defaults to `UTC` so existing rows stay
      valid).
- [x] `EmailOutboxKind` (`SELF_BIRTHDAY` / `FRIEND_BIRTHDAY_UPCOMING` /
      `FRIEND_BIRTHDAY_TODAY`) and `EmailOutboxStatus` (`PENDING` / `SENDING` /
      `SENT` / `FAILED`).
- [x] `EmailOutbox`, unique on `(kind, recipientId, subjectId, occursOn)` —
      the constraint the hourly evaluate pass relies on. `occursOn` is a DATE;
      `subjectId` is deliberately not an FK, same precedent as
      `Notification.subjectId`.
- [x] Indexes on `(status, createdAt)` for claiming and `(status, sentAt)` for
      the quota count and cleanup sweep.
- [x] `friends.birthday.{reminderdays,dailysendcap,senderemail,sendername}`
      seeded into `AppConfig` with `update: {}`, so re-seeding never overwrites
      a value edited in the database.

## API

- [x] `CronGuard` — `x-admin-key` only, no session. `ADMIN_KEY_HEADER` and the
      timing-safe compare moved to `libs/admin-key.ts` and shared with
      `AdminGuard` rather than duplicated.
- [x] `cron` module at `POST /cron/friends/birthdays/{evaluate,process,cleanup}`.
- [x] `birthday-schedule.ts` — pure civil-date maths (zone resolution, next
      occurrence, Feb 29 handling), unit tested. No instants, so DST can't
      shift a count.
- [x] `evaluate` derives the full set of due reminders each run and writes with
      `skipDuplicates`; recipients are the owner's `ACCEPTED` connections, read
      through the existing cached `ConnectionsService.getContext`.
- [x] `FriendVisibility.NONE` suppresses the friend-facing kinds but not
      `SELF_BIRTHDAY` — the owner's own inbox is not a disclosure.
- [x] `process` claims with `UPDATE ... FOR UPDATE SKIP LOCKED ... RETURNING`,
      isolates per-row failures, and aborts only on a rate limit.
- [x] `EmailService.send` sends raw `htmlContent`/`subject`/`sender` (not a
      Brevo dashboard `templateId`); `isRateLimitError` reads the 429 out of
      whichever shape the Brevo SDK throws.
- [x] `birthday-email-templates.ts` — one render function per
      `EmailOutboxKind`, sharing an inline-styled layout. User-derived strings
      are HTML-escaped once, in the layout function.
- [x] Retries: a failed row returns to `PENDING` until 3 attempts, then stops
      at `FAILED`.
- [x] If the sender pair (`friends.birthday.senderemail`/`sendername`) is
      unset, `process` logs and returns without claiming anything — no rows
      are held in `SENDING` for a config problem.
- [x] Rows with no matching subject profile (deleted mid-batch) are released
      untouched rather than failed.
- [x] `UpdateMeDto.timezone` with an `IsTimezone` validator; `UserDto.timezone`
      so the client can prefill. Timezone rides the existing `PATCH /users/me`
      rather than adding an onboarding-only endpoint, which also makes it
      editable after onboarding.

## Frontend

- [x] `SearchableSelect` extracted to `packages/ui` — the birth-year picker and
      the timezone picker are the same widget, so `BirthdayFields` was moved
      onto it rather than the pattern being copied.
- [x] `OnboardingTimezoneStep` between the birthday and connections steps,
      prefilled from `Intl.DateTimeFormat().resolvedOptions().timeZone` and
      editable — same "detect, then let them correct it" shape as the name and
      avatar steps. Options are labelled with their current UTC offset.
- [x] i18n keys added for en / vi / ja / zh.

## Infra

- [x] `infra/modules/scheduler` — three scheduled `aws_cloudwatch_event_rule`
      resources (evaluate hourly, process hourly, cleanup daily) targeting an
      `aws_cloudwatch_event_api_destination` per route, authenticated via a
      shared `aws_cloudwatch_event_connection` (`API_KEY`, `x-admin-key`
      header sourced from `module.secrets.admin_api_key`). Wired into
      `infra/main.tf` as `module "scheduler"`. Replaces the earlier
      cronjob.com-based setup. Scheduled rules are not billed and the ~1,490
      API destination invocations/month cost fractions of a cent.
      EventBridge **Scheduler** does not accept API destination targets —
      `CreateSchedule` fails with "Provided Arn is not in correct format" —
      so rules, not schedules, are the correct resource here. Rule cron is
      6-field and always UTC; the per-user timezone logic lives in `evaluate`,
      not in the schedule.
- [x] Two apply-time constraints `terraform validate` cannot catch, both hit
      once already: the target's `retry_policy` must set
      `maximum_event_age_in_seconds` explicitly, because the provider
      serializes the omitted field as `0` and `PutTargets` requires >= 60; and
      the target sets `input = "{}"` so the routes receive an empty body
      rather than EventBridge's event envelope.

## Outstanding

- [ ] Set `friends.birthday.senderemail` / `sendername` in `AppConfig` per
      environment if the seeded defaults aren't right for that environment.
      Until set, `process` logs a warning and sends nothing.
- [ ] No alerting on rows stuck in `SENDING` or sitting at `FAILED`. At this
      size that is a manual check.
