# Leave balance, work schedule, and holidays

Convention and group travel often spans workweeks. Users track their own leave
allowance, work schedule, and holidays inside `apps/travel` without needing an
HR system, and every `TravelParticipation` automatically deducts only actual
working days from the matching leave bucket.

## Model

```text
User ──┬── TravelJobProfile (1:1)
       ├── TravelWorkSchedule (1:1)
       ├──< TravelScheduleException (unique per user + date)
       └──< TravelCustomHoliday (unique per user + date)
```

- **Job profile (`TravelJobProfile`).** Holds `title`, `daysOfLeave` (annual
  allowance), `daysOfSickLeave`, and `leaveCycleStart` (anchor date for the
  rolling 1-year leave cycle). Calling `POST /travel/job-profiles/me/confirm`
  bumps `updatedAt` to record that the user reviewed their allowance for the
  current cycle.
- **Work schedule (`TravelWorkSchedule`).** Seven booleans (`sunday` through
  `saturday`, defaulting to Mon–Fri true, Sat–Sun false) so shift workers and
  non-standard schedules calculate leave accurately.
- **Schedule exceptions (`TravelScheduleException`).** Per-date overrides
  (`isWorkDay: true` = forced work day / swap day; `false` = forced off day)
  with an optional `reason`.
- **Custom holidays (`TravelCustomHoliday`).** Personal or company holidays
  (`date`, `name`) that never count against leave.
- **Holiday country.** Stored in the shared `UserSetting` table
  (`scope = AppScope.TRAVEL`, `type = 'travel.country'`, default `'VN'`) rather
  than adding a travel-specific column to `User`.

## Working-day calculation

When computing used leave for a participation window `[from, to]` (inclusive),
each calendar day is evaluated in strict precedence order:

1. **Schedule exception** for that date — if present, `isWorkDay` decides
   immediately (highest priority).
2. **Custom holiday** for that date — not a working day.
3. **Public holiday** for the user's configured country — fetched via
   `date-holidays` (`type` in `public` | `bank`), cached in Redis per
   `holidays:<country>:<year>` for 24 hours; not a working day.
4. **Work schedule** weekday boolean — fallback.

Only `ANNUAL` and `SICK` participations deduct from their respective allowances;
`UNPAID` participations are tracked on the calendar and heatmap without reducing
paid leave balances.

## Leave cycle

The active cycle is computed from `leaveCycleStart` by advancing it in 1-year
increments until `cycleFrom <= now < addYears(cycleFrom, 1)`. The balance
endpoint (`GET /travel/leave-balance`) returns `{ annual, sick, cycleFrom, cycleTo }`
with `{ total, used, remaining }` for each bucket.

## Views

- **Travel overview / dashboard.** Lives side-by-side with the Food Catalog in
  the top-level navigation, bringing together the user's Leave Balance card,
  Upcoming Plans, and Quick Actions (new plan, browse events, manage schedule).
- **Schedule & calendar (`/schedule`).** Monthly calendar showing work/off
  shading, public and custom holidays, and leave badges per day, alongside a
  GitHub-style **leave heatmap** (`GET /travel/heatmap`) that expands
  participations into per-day fractional intensities.
- **Settings (`/settings/*`).** Dedicated tabs for self-service leave allowance
  (`TravelJobProfile`, also manageable by admins in `/admin`), weekly work
  schedule + exceptions, and public/custom holidays (including lunar-calendar
  helpers where applicable via `lunar-typescript`).
