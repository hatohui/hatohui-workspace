export const UPCOMING_GROUP_OPTIONS = ['month', 'age', 'year', 'none'] as const;
export type UpcomingGroupOption = (typeof UPCOMING_GROUP_OPTIONS)[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export const UNKNOWN_GROUP_SORT_VALUE = Number.MAX_SAFE_INTEGER;
