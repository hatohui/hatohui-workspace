# Art storage layout

The bucket is shared by every app, so each app owns a top-level prefix and
`uploads/` is only ever a staging area. The key layout itself lives in
`apps/api/src/common/utils/asset-paths.ts`; this page records why it looks the
way it does.

## Gallery

```text
art/<artist>/gallery/<uuid>.<ext>            original
art/<artist>/thumbnails/<uuid>-<name>.webp   generated thumbnail
art/<artist>/previews/<uuid>-<name>.webp     generated preview
```

- Three sizes, so nothing loads a multi-megabyte original just to look at it:
  the **thumbnail** (512px WebP) fills grids and cards, the **preview** (2048px
  WebP) fills the artwork page and the zoom viewer, and the **original** is only
  fetched through the viewer's download button and the "Open original" link.
  Both derived sizes keep the aspect ratio and are never upscaled.
- Assets created before previews existed were re-queued by the
  `asset_preview` migration, which regenerates both sizes and deletes the old
  1600px thumbnail.

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
