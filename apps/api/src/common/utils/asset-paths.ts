/// The one place the object-storage key layout is defined.
///
/// Uploads are a two-step flow: the client asks for a presigned URL before the
/// owning record necessarily exists (creating a friend, submitting a
/// commission), so the final key cannot be known at signing time. Everything is
/// therefore signed into a per-uploader staging prefix, and the service that
/// persists the key relocates the object into its permanent home. That keeps
/// placement server-authoritative — a client can never write to another
/// owner's folder by choosing its own key.
///
/// Layout, under the bucket served at R2_PUBLIC_URL:
///
///   uploads/<uploaderUserId>/<uuid>.<ext>   staging, pre-relocation
///   avatars/<profileId>/<uuid>.<ext>        live avatar + its version history
///   art/commissions/<userId>/<uuid>.<ext>   delivered commission artwork
///   art/references/<userId>/<uuid>.<ext>    client-supplied reference images
///
/// Avatars key off the *profile* id, not the user id, because a profile can
/// exist unclaimed with no account behind it, and AvatarVersion.ownerId is
/// already a profile id — so a profile's whole avatar history lands in one
/// folder.
import { randomUUID } from 'node:crypto';

export const STAGING_PREFIX = 'uploads';
export const AVATARS_PREFIX = 'avatars';
export const COMMISSIONS_PREFIX = 'art/commissions';
export const REFERENCES_PREFIX = 'art/references';
export const ASSET_THUMBNAILS_PREFIX = 'art/assets/thumbnails';

/// Where a freshly signed upload goes before its owning record exists.
export function stagedUploadKey(uploaderId: string, extension: string): string {
  return `${STAGING_PREFIX}/${uploaderId}/${randomUUID()}.${extension}`;
}

export function isStagedKey(key: string): boolean {
  return key.startsWith(`${STAGING_PREFIX}/`);
}

export function avatarKeyFor(profileId: string, sourceKey: string): string {
  return `${AVATARS_PREFIX}/${profileId}/${fileNameOf(sourceKey)}`;
}

export function commissionAssetKeyFor(
  userId: string,
  sourceKey: string,
): string {
  return `${COMMISSIONS_PREFIX}/${userId}/${fileNameOf(sourceKey)}`;
}

export function referenceAssetKeyFor(
  userId: string,
  sourceKey: string,
): string {
  return `${REFERENCES_PREFIX}/${userId}/${fileNameOf(sourceKey)}`;
}

export function assetThumbnailKeyFor(sourceKeyOrFilename: string): string {
  const base = fileNameOf(sourceKeyOrFilename).replace(/\.[^.]+$/, '');
  return `${ASSET_THUMBNAILS_PREFIX}/${randomUUID()}-${base}.webp`;
}

function fileNameOf(key: string): string {
  return key.split('/').pop() as string;
}
