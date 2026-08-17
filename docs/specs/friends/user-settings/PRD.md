# User settings

Per-user overrides of the app-wide defaults in `AppConfig`, stored generically
so every app in the monorepo can use one table rather than growing its own
columns on `User`.

## The table

`UserSetting` is deliberately the mirror image of `AppConfig`:

| | `AppConfig` | `UserSetting` |
| --- | --- | --- |
| Key | `(type, scope)` | `(userId, type, scope)` |
| Value | `String` | `String` |
| Means | the app-wide default | one account's override |

Same `type` vocabulary, same `AppScope` partition, same stringly-typed value.
A reader resolves a setting by looking for the `UserSetting` row first and
falling back to `AppConfig`.

**An absent row means "inherit the default".** That is the whole reason the
value is not stored as a column on `User`: a scalar list column cannot be null
in Prisma, so "never configured" and "configured to nothing" would collapse
into the same empty array. With a row, presence is the signal — and an empty
*value* is then free to mean something real, which is how an account turns
birthday emails off entirely.

`User` keeps only identity fields that are global to the account (`timezone`
is scheduling identity, not a per-app preference, so it stays a column).

## Access

`UserSettingsService` (`modules/user-settings/`) is app-agnostic — get, set,
clear, everything for a scope, and one type across many users. Setting keys
live in `user-settings.constants.ts` so the string literal is written once.

Storage is generic; the **API surface is typed**. `birthdayReminderLeadDays`
is a real field on `UserDto`/`UpdateMeDto`, not a `Record<string, string>`
bag, because Orval turns the DTO into the frontend's types and a generic
key-value endpoint would erase them. Other apps should add their own typed
fields backed by the same table rather than exposing the bag.

## Birthday reminder lead days

`friends.birthday.reminderleaddays`, scope `FRIENDS`, value a sorted CSV of
days before the birthday (`"0,7"` — 0 being the day itself). The app-wide
default remains `friends.birthday.reminderdays` in `AppConfig`, which an
unconfigured account inherits as `[0, <reminderdays>]`, matching the behaviour
before the setting existed.

The choice is **the recipient's**, not the birthday owner's — the person
receiving the email decides how much notice they want. `evaluate` therefore
loads every account's lead days once per run and tests each connection
individually, rather than comparing one app-wide number against the day count.

`EmailOutbox.leadDays` exists for the same reason and is part of the unique
index. Without it, an account asking for both a month's and a week's notice
would produce two `FRIEND_BIRTHDAY_UPCOMING` rows identical in
`(kind, recipientId, subjectId, occursOn)`, and `skipDuplicates` would
silently drop the second — the reminder nearest the birthday, the one that
matters most.
