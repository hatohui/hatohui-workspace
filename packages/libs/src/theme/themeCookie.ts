import {
  THEME_COOKIE_MAX_AGE_SECONDS,
  THEME_COOKIE_NAME,
  THEME_COOKIE_ROOT_DOMAIN,
} from './themeConstants';

function sharedDomainAttribute(hostname: string): string {
  const isOnRootDomain =
    hostname === THEME_COOKIE_ROOT_DOMAIN ||
    hostname.endsWith(`.${THEME_COOKIE_ROOT_DOMAIN}`);
  return isOnRootDomain ? `; domain=${THEME_COOKIE_ROOT_DOMAIN}` : '';
}

export function readThemeCookie(): string | null {
  const prefix = `${THEME_COOKIE_NAME}=`;
  const entry = document.cookie
    .split('; ')
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

export function writeThemeCookie(value: string): void {
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; samesite=lax${sharedDomainAttribute(window.location.hostname)}${secure}`;
}
