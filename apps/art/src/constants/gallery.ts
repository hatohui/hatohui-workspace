export const GALLERY_PAGE_SIZE = 24;

export const GALLERY_TILE_ASPECT_FALLBACK = 1;
export const GALLERY_TILE_ASPECT_MIN = 0.5;
export const GALLERY_TILE_ASPECT_MAX = 2.5;
export const GALLERY_MAX_ROW_HEIGHT_PX = 260;
export const GALLERY_TILE_GROWTH_ALLOWANCE = 1.5;
export const GALLERY_LAST_ROW_STRETCH_MIN_FILL = 0.5;
export const GALLERY_FULL_ROW_BASIS_SLACK = 0.999;
export const ASSET_SUMMARY_TAG_LIMIT = 3;
export const ASSET_TITLE_MAX_LENGTH = 120;
export const ASSET_DESCRIPTION_MAX_LENGTH = 2000;
export const GALLERY_MOSAIC_SIZES = '(min-width: 1024px) 50vw, 100vw';
export const GALLERY_MOSAIC_PATTERNS = [
  [1, 2],
  [2, 1],
  [1, 2, 1],
  [2, 2],
  [1],
  [2, 1, 2],
  [1, 1],
];
export const GALLERY_MOSAIC_GAP_PX = 8;
export const GALLERY_MOSAIC_GAP_SM_PX = 12;
export const GALLERY_MOSAIC_SM_BREAKPOINT = 640;
export const GALLERY_MOSAIC_MIN_TILE_WIDTH_PX = 100;
export const GALLERY_MOSAIC_MIN_TILE_HEIGHT_PX = 90;
export const GALLERY_MOSAIC_MIN_HEIGHT_RATIO = 0.22;
export const GALLERY_MOSAIC_MAX_HEIGHT_RATIO = 0.75;
export const ARTWORK_FALLBACK_DIMENSION_PX = 1200;
export const WORKSPACE_GALLERY_ROUTE = '/app/gallery';
export const GALLERY_SECTION_PARAM = 'section';
export const GALLERY_PROJECTS_SECTION = 'projects';
export const GALLERY_PROJECTS_SECTION_QUERY = `${GALLERY_SECTION_PARAM}=${GALLERY_PROJECTS_SECTION}`;
export const UPLOAD_CONCURRENCY = 4;
export const BYTES_PER_MEGABYTE = 1024 * 1024;
export const ASSET_DELETION_QUERY_PREFIXES = ['/assets', '/projects'] as const;
export const GALLERY_SEARCH_DEBOUNCE_MS = 300;
export const GALLERY_TAG_SUGGESTION_LIMIT = 8;
