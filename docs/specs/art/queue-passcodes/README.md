# Queue passcodes

The public queue (`/queue`) lists an artist's active commissions in
work order. Each row is clickable. A row with a **passcode** asks for it and
trades it for the private order `accessCode`; a row without one carries its
`accessCode` and opens directly, so any visitor can open it. A client or artist
sets a passcode to make an order private. Clients can set one only once the
commission is accepted (`CLIENT_PASSCODE_STATUSES`), so the request form no
longer asks for it.

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

- `POST /commission-access/unlock` — commission id + passcode → `accessCode`.
  Ids come from the public queue or from an email lookup.
- `POST /commission-access/lookup` — artist + email → that client's orders.
  Orders without a passcode come back with their `accessCode`, so they open
  straight away; passcode-protected ones return `accessCode: null` and
  `requiresPasscode: true`, and the client unlocks them by id.

  This deliberately trades privacy for convenience: anyone who knows a
  client's email can open that client's orders that have no passcode. (An
  earlier version required email + passcode for exactly this reason.) Setting
  a passcode is how a client or artist opts an order out.

- `PUT /commission-access/code/:code/passcode` — client sets their own,
  authorised by holding the access code.
- `GET|PUT|DELETE /commission-access/:commissionId/passcode` — artist.

Wrong passcodes and unknown ids on `unlock` return the same 403 so the endpoint
can't be used to probe which items have passcodes. All unauthenticated
endpoints share an IP rate limit (20 attempts / 15 min, Redis) and fail open
if Redis is unreachable, matching the image-sign limiter.

## What the queue shows

Position, commission type, a three-step stage (`WAITING`, `SKETCHING`,
`IN_PROGRESS`) and the queued date. Sketch approval is internal: the client
approves a sketch from an update post that asks for it, which moves `SKETCH`
to `CONFIRMED` (shown as `IN_PROGRESS`). No client names,
prices or ideas. Positions are over the full work order, including
commissions hidden from the public list, so a client's number matches what
their order page says.
