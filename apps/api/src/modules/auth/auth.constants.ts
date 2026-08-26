export const SESSION_COOKIE_NAME = 'hatohui_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export const ADMIN_EMAIL_CONFIG_TYPE = 'admin.email';
export const ROLE_CACHE_TTL_SECONDS = 300;

export const ROLE_KEYS = {
  user: 'user',
  artist: 'artist',
  admin: 'admin',
} as const;
export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];
