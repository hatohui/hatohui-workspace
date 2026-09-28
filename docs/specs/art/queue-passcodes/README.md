# Queue passcodes

The public queue (`/[artist]/queue`) lists an artist's active commissions in
work order. Each row is clickable; opening one requires the commission's
**passcode**, which trades for the private order `accessCode`.

## Who sets the passcode

`Commission.passcodeSource` records it:

| Source      | How                                                              |
| ----------- | ---------------------------------------------------------------- |
| `CLIENT`    | Optional field on the request form, or later from the order page |
| `ARTIST`    | Custom value typed in the commission's admin panel               |
| `GENERATED` | "Generate" in the admin panel — 8 chars, no ambiguous glyphs     |

Only a scrypt hash is stored, so a generated or artist-set passcode is shown
to the artist exactly once, in the response that set it. Generated codes are
compared case- and separator-insensitively; typed ones are compared exactly.

## Endpoints (`commission-access` module)

- `POST /commission-access/unlock` — queue item id + passcode → `accessCode`.
  Only works on items currently visible in the public queue.
- `POST /commission-access/lookup` — artist + email + passcode → matching
  orders. Replaces the old `GET /commissions/lookup?email=`, which returned
  every commission (and its access code) for any email without proof of
  ownership.
- `PUT /commission-access/code/:code/passcode` — client sets their own,
  authorised by holding the access code.
- `GET|PUT|DELETE /commission-access/:commissionId/passcode` — artist.

Wrong passcodes and unknown/hidden items return the same 403 so the endpoint
can't be used to probe which items have passcodes. All unauthenticated
endpoints share an IP rate limit (20 attempts / 15 min, Redis) and fail open
if Redis is unreachable, matching the image-sign limiter.

## What the queue shows

Position, commission type, a four-step stage (`WAITING`, `SKETCHING`,
`SKETCH_APPROVED`, `IN_PROGRESS`) and the queued date. No client names,
prices or ideas. Positions are over the full work order, including
commissions hidden from the public list, so a client's number matches what
their order page says.
