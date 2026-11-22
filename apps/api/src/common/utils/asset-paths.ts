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
///   uploads/<client-name>/<uuid>.<ext>      staging for logged-out clients
///   avatars/<profileId>/<uuid>.<ext>        live avatar + its version history
///   art/<artist>/gallery/<uuid>.<ext>       an artist's gallery uploads
///   art/<artist>/thumbnails/<uuid>-<name>.webp  gallery thumbnails
///   art/<artist>/previews/<uuid>-<name>.webp    gallery viewer previews
///   art/<artist>/process/<uuid>.<ext>       sketch-to-final process images
///   art/commissions/<userId>/<uuid>.<ext>   delivered commission artwork
///   art/references/<userId>/<uuid>.<ext>    client-supplied reference images
///   travel/recommendations/<id>/<uuid>.<ext>  photos of a place's dish
///
/// Avatars key off the *profile* id, not the user id, because a profile can
/// exist unclaimed with no account behind it, and AvatarVersion.ownerId is
/// already a profile id — so a profile's whole avatar history lands in one
/// folder. `<artist>` is the storefront handle, or the user id while the
/// artist has none — see docs/specs/art/storage-layout.
import { randomUUID } from 'node:crypto';

export const STAGING_PREFIX = 'uploads';
export const UNNAMED_UPLOADER_SEGMENT = 'client';
export const MAX_PATH_SEGMENT_LENGTH = 40;
export const AVATARS_PREFIX = 'avatars';
export const COMMISSIONS_PREFIX = 'art/commissions';
export const REFERENCES_PREFIX = 'art/references';
export const ART_PREFIX = 'art';
export const GALLERY_SEGMENT = 'gallery';
export const THUMBNAILS_SEGMENT = 'thumbnails';
export const PREVIEWS_SEGMENT = 'previews';
export const PROCESS_SEGMENT = 'process';
export const UNASSIGNED_ARTIST_SEGMENT = 'unassigned';
export const TRAVEL_RECOMMENDATIONS_PREFIX = 'travel/recommendations';
export const TRAVEL_DISHES_PREFIX = 'travel/dishes';
export const TRAVEL_EVENTS_PREFIX = 'travel/events';
export const TRAVEL_GROUPS_PREFIX = 'travel/groups';
export const TRAVEL_ACTIVITIES_PREFIX = 'travel/activities';
export const TRAVEL_SPOTS_PREFIX = 'travel/spots';

/// Where a freshly signed upload goes before its owning record exists.
export function stagedUploadKey(owner: string, extension: string): string {
  return `${STAGING_PREFIX}/${owner}/${randomUUID()}.${extension}`;
}

/// Turns a free-text name into a safe single path segment.
export function pathSegmentOf(label: string): string {
  const segment = label
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_PATH_SEGMENT_LENGTH)
    .replace(/-+$/, '');
  return segment || UNNAMED_UPLOADER_SEGMENT;
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

export function travelRecommendationImageKeyFor(
  recommendationId: string,
  sourceKey: string,
): string {
  return `${TRAVEL_RECOMMENDATIONS_PREFIX}/${recommendationId}/${fileNameOf(sourceKey)}`;
}

export function galleryAssetKeyFor(artist: string, sourceKey: string): string {
  return `${ART_PREFIX}/${artist}/${GALLERY_SEGMENT}/${fileNameOf(sourceKey)}`;
}

export function processImageKeyFor(artist: string, sourceKey: string): string {
  return `${ART_PREFIX}/${artist}/${PROCESS_SEGMENT}/${fileNameOf(sourceKey)}`;
}

export function assetThumbnailKeyFor(
  artist: string,
  sourceKeyOrFilename: string,
): string {
  return derivedImageKeyFor(THUMBNAILS_SEGMENT, artist, sourceKeyOrFilename);
}

export function assetPreviewKeyFor(
  artist: string,
  sourceKeyOrFilename: string,
): string {
  return derivedImageKeyFor(PREVIEWS_SEGMENT, artist, sourceKeyOrFilename);
}

function derivedImageKeyFor(
  segment: string,
  artist: string,
  sourceKeyOrFilename: string,
): string {
  const base = fileNameOf(sourceKeyOrFilename).replace(/\.[^.]+$/, '');
  return `${ART_PREFIX}/${artist}/${segment}/${randomUUID()}-${base}.webp`;
}

export function travelDishImageKeyFor(
  dishId: string,
  sourceKey: string,
): string {
  return `${TRAVEL_DISHES_PREFIX}/${dishId}/${fileNameOf(sourceKey)}`;
}

export function travelDishVariantKeyFor(
  dishId: string,
  variant: typeof THUMBNAILS_SEGMENT | typeof PREVIEWS_SEGMENT,
  sourceKey: string,
): string {
  const base = fileNameOf(sourceKey).replace(/\.[^.]+$/, '');
  return `${TRAVEL_DISHES_PREFIX}/${dishId}/${variant}/${randomUUID()}-${base}.webp`;
}

export function travelRecommendationVariantKeyFor(
  recommendationId: string,
  variant: typeof THUMBNAILS_SEGMENT | typeof PREVIEWS_SEGMENT,
  sourceKey: string,
): string {
  const base = fileNameOf(sourceKey).replace(/\.[^.]+$/, '');
  return `${TRAVEL_RECOMMENDATIONS_PREFIX}/${recommendationId}/${variant}/${randomUUID()}-${base}.webp`;
}

export function travelEventImageKeyFor(
  eventId: string,
  sourceKey: string,
): string {
  return `${TRAVEL_EVENTS_PREFIX}/${eventId}/${fileNameOf(sourceKey)}`;
}

export function travelEventVariantKeyFor(
  eventId: string,
  variant: typeof THUMBNAILS_SEGMENT | typeof PREVIEWS_SEGMENT,
  sourceKey: string,
): string {
  const base = fileNameOf(sourceKey).replace(/\.[^.]+$/, '');
  return `${TRAVEL_EVENTS_PREFIX}/${eventId}/${variant}/${randomUUID()}-${base}.webp`;
}

export function travelGroupImageKeyFor(
  groupId: string,
  sourceKey: string,
): string {
  return `${TRAVEL_GROUPS_PREFIX}/${groupId}/${fileNameOf(sourceKey)}`;
}

export function travelGroupVariantKeyFor(
  groupId: string,
  variant: typeof THUMBNAILS_SEGMENT | typeof PREVIEWS_SEGMENT,
  sourceKey: string,
): string {
  const base = fileNameOf(sourceKey).replace(/\.[^.]+$/, '');
  return `${TRAVEL_GROUPS_PREFIX}/${groupId}/${variant}/${randomUUID()}-${base}.webp`;
}

export function travelActivityImageKeyFor(
  activityId: string,
  sourceKey: string,
): string {
  return `${TRAVEL_ACTIVITIES_PREFIX}/${activityId}/${fileNameOf(sourceKey)}`;
}

export function travelActivityVariantKeyFor(
  activityId: string,
  variant: typeof THUMBNAILS_SEGMENT | typeof PREVIEWS_SEGMENT,
  sourceKey: string,
): string {
  const base = fileNameOf(sourceKey).replace(/\.[^.]+$/, '');
  return `${TRAVEL_ACTIVITIES_PREFIX}/${activityId}/${variant}/${randomUUID()}-${base}.webp`;
}

export function travelSpotImageKeyFor(
  spotId: string,
  sourceKey: string,
): string {
  return `${TRAVEL_SPOTS_PREFIX}/${spotId}/${fileNameOf(sourceKey)}`;
}

export function travelSpotVariantKeyFor(
  spotId: string,
  variant: typeof THUMBNAILS_SEGMENT | typeof PREVIEWS_SEGMENT,
  sourceKey: string,
): string {
  const base = fileNameOf(sourceKey).replace(/\.[^.]+$/, '');
  return `${TRAVEL_SPOTS_PREFIX}/${spotId}/${variant}/${randomUUID()}-${base}.webp`;
}

function fileNameOf(key: string): string {
  return key.split('/').pop() as string;
}
