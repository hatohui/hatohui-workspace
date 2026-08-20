export const DEFAULT_ADMIN_PAGE = 1;
export const DEFAULT_ADMIN_PAGE_SIZE = 50;

export const ADMIN_USER_SORT_OPTIONS = [
  'name',
  'email',
  'timezone',
  'createdAt',
] as const;
export type AdminUserSortOption = (typeof ADMIN_USER_SORT_OPTIONS)[number];

export const ADMIN_SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type AdminSortDirection = (typeof ADMIN_SORT_DIRECTIONS)[number];

export const ADMIN_USER_DEFAULT_SORT: AdminUserSortOption = 'createdAt';
export const ADMIN_DEFAULT_SORT_DIRECTION: AdminSortDirection = 'desc';

export const SYSTEM_PARAMETERS_CACHE_TTL_SECONDS = 300;
