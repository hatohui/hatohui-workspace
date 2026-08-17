# The modules behind `/friends`, and the route-shadowing trap

`/friends` is served by three modules, not one:

| Module         | Concern                              | Controller              |
| -------------- | ------------------------------------ | ----------------------- |
| `profiles`     | profile CRUD, avatars, claim/connect | `FriendsController`     |
| `birthdays`    | upcoming sections, by-month          | `BirthdaysController`   |
| `social-graph` | the social tree                      | `SocialGraphController` |

They were a single `friends` module with one 240-line controller and three
injected services. The split follows the repo's rule that a module is one
resource: `friends` was a domain grouping while its siblings (`connections`,
`avatars`, `social-platforms`) were resources, so the module list was applying
two different grouping rules at once.

## The trap

`FriendsController` owns `@Get(':id')`, which matches `/friends/social-graph`,
`/friends/birthdays-by-month` and `/friends/upcoming/sections` just as happily
as a real id. Express matches the first registered path that fits, so if
`FriendsController` registers first, all three specific routes resolve to
`profiles.findOne('social-graph')` and return **404**.

Nothing fails at compile time, and — importantly — **the OpenAPI spec still
looks correct**, because it is built from decorator metadata rather than from
the router. A byte-identical `openapi.json` is not evidence that routing works.
Only an actual request is.

## What controls registration order (and what does not)

Not the `imports` array in `app.module.ts`. Nest inserts modules into its
container during a **depth-first scan** of the module graph, and the router
registers controllers in that insertion order. A module reached through another
module's `imports` is inserted at the point it is _reached_, not at its position
in the app's list.

This bit us once. With `BirthdaysModule` and `SocialGraphModule` both importing
`ProfilesModule`, and all three listed in that order in `app.module.ts`:

```text
scan AppModule → … → BirthdaysModule → (its imports) ProfilesModule → SocialGraphModule
```

`ProfilesModule` got inserted while scanning `BirthdaysModule`'s imports —
before `SocialGraphModule` was ever reached. `/friends/social-graph` mapped
last, after `/friends/:id`, and returned 404 in exactly the way described
above, despite `app.module.ts` listing it first.

## How it is kept correct

`ViewerContextService` — the only DI dependency `birthdays` and `social-graph`
had on `profiles` — lives in its own `viewer-context` module. All three import
`ViewerContextModule`; none of them import `ProfilesModule`. With no transitive
pull, the `app.module.ts` order takes effect, and `BirthdaysModule` /
`SocialGraphModule` sitting above `ProfilesModule` is what puts the literal
routes first.

The remaining cross-module imports (`toFriendDto`, `PROFILE_INCLUDE`,
`birthdayVisibilityWhere`, `FriendDto`) are plain functions and types. They do
not appear in any `imports` array, so they have no effect on the module graph or
on route order.

**So: do not add `ProfilesModule` to `BirthdaysModule` or `SocialGraphModule`,
and keep both above `ProfilesModule` in `app.module.ts`.** Any module added
later that serves a literal first segment under `/friends` has the same two
constraints.

## Verifying after any change here

The spec diff will not catch a regression. Boot the API and check that the
literal routes do not fall through to `:id` — `/friends/social-graph` must
answer `401` (its `AuthGuard` rejecting an anonymous caller), never `404`:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4310/friends/social-graph
```

## What did not change in the split

Route paths, guards, controller class names and `operationId`s are identical to
the pre-split versions — the exported spec is byte-identical to the committed
`packages/models/openapi.json`, so the generated client is unaffected.
`UpcomingFriendDto`, `SocialGraphNodeDto` and `SocialGraphDto` moved to their
owning module's `dto/` folder but kept their class names, which is what the
OpenAPI schema names derive from.
