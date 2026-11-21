import {
  GALLERY_MOSAIC_FEATURE_CHANCE,
  GALLERY_MOSAIC_FEATURE_MAX_ASPECT,
  GALLERY_MOSAIC_FEATURE_MIN_ASPECT,
  GALLERY_MOSAIC_LANDSCAPE_MIN_ASPECT,
} from '@/constants/gallery';

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

function seededUnit(key: string): number {
  let hash = FNV_OFFSET;
  for (let i = 0; i < key.length; i++) {
    hash = Math.imul(hash ^ key.charCodeAt(i), FNV_PRIME);
  }
  return (hash >>> 0) / 2 ** 32;
}

export function mosaicColumnSpan(key: string, aspect: number): number {
  if (aspect >= GALLERY_MOSAIC_LANDSCAPE_MIN_ASPECT) return 2;
  const isNearSquare =
    aspect >= GALLERY_MOSAIC_FEATURE_MIN_ASPECT &&
    aspect <= GALLERY_MOSAIC_FEATURE_MAX_ASPECT;
  return isNearSquare && seededUnit(key) < GALLERY_MOSAIC_FEATURE_CHANCE
    ? 2
    : 1;
}
