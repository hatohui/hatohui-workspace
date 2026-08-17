export const ASSET_SORT_OPTIONS = [
  'newest',
  'oldest',
  'size',
  'alphabetical',
] as const;
export type AssetSortOption = (typeof ASSET_SORT_OPTIONS)[number];
