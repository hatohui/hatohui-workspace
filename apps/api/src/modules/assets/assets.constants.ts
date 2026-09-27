export const ASSET_SORT_OPTIONS = [
  'newest',
  'oldest',
  'size',
  'alphabetical',
] as const;
export type AssetSortOption = (typeof ASSET_SORT_OPTIONS)[number];

export const ASSET_BULK_MAX = 100;

export const ASSET_TITLE_MAX_LENGTH = 120;
export const ASSET_DESCRIPTION_MAX_LENGTH = 2000;
