# Art storage layout

The bucket is shared by every app, so each app owns a top-level prefix and
`uploads/` is only ever a staging area. The key layout itself lives in
`apps/api/src/common/utils/asset-paths.ts`; this page records why it looks the
way it does.

## Gallery

```text
art/<artist>/gallery/<uuid>.<ext>            original
art/<artist>/thumbnails/<uuid>-<name>.webp   generated thumbnail
```

- `<artist>` is the storefront handle (`Profile.handle`, `^[a-z0-9_]{3,20}$`,
  so it is already a safe path segment). An artist without a handle falls back
  to their user id; an asset with no uploader goes under `unassigned`.
- The folder is chosen **at upload time** and never follows a later handle
  change. Keys are identities, not display names — renaming would mean moving
  every object and rewriting every stored URL. A renamed artist simply has
  older files under their old handle.
- `POST /assets` moves a staged key (`uploads/<userId>/…`) into the gallery.
  It only accepts a staged key from the caller's own staging folder, so an
  artist cannot claim someone else's upload.
- Assets created by `ensureForUrl` (commission progress images linked into a
  project) are **not** moved: their URL is also stored in
  `CommissionProgress.images`, and moving the object would break it. Their
  thumbnails still go to `art/<artist>/thumbnails/`.
