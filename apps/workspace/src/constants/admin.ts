export const ADMIN_USERS_PAGE_SIZE = 25;

export const ADMIN_USER_SORT_OPTIONS = [
  'name',
  'email',
  'timezone',
  'createdAt',
] as const;
export type AdminUserSortOption = (typeof ADMIN_USER_SORT_OPTIONS)[number];

export const ADMIN_SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type AdminSortDirection = (typeof ADMIN_SORT_DIRECTIONS)[number];

export const ADMIN_ONBOARDING_STATUSES = [
  'PENDING',
  'COMPLETED',
  'SKIPPED',
] as const;

export const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
