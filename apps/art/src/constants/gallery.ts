import { AssetsSort } from '@hatohui/models';

export const GALLERY_SORT_OPTIONS = Object.values(AssetsSort);
export const GALLERY_PAGE_SIZE = 24;

export const GALLERY_TILE_ASPECT_FALLBACK = 1;
export const GALLERY_TILE_ASPECT_MIN = 0.5;
export const GALLERY_TILE_ASPECT_MAX = 2.5;
export const GALLERY_MAX_ROW_HEIGHT_PX = 260;
export const GALLERY_TILE_GROWTH_ALLOWANCE = 1.5;
export const GALLERY_ROW_HEIGHT_CLASS =
  '[--gallery-row:120px] sm:[--gallery-row:200px] lg:[--gallery-row:260px]';
export const ARTWORK_FALLBACK_DIMENSION_PX = 1200;
export const WORKSPACE_GALLERY_ROUTE = '/app/gallery';
export const UPLOAD_CONCURRENCY = 4;
export const BYTES_PER_MEGABYTE = 1024 * 1024;
export const ASSET_DELETION_QUERY_PREFIXES = ['/assets', '/projects'] as const;
