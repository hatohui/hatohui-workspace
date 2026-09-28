export const THEME_MODES = ['light', 'dark', 'system'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export const THEME_COOKIE_NAME = 'hatohui_theme';

export const THEME_COOKIE_ROOT_DOMAIN = 'hatohui.com';

export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

export const DARK_CLASS = 'dark';

export const themeInitScript = `(function(){try{var c=document.cookie.match(/(?:^|; )${THEME_COOKIE_NAME}=([^;]*)/);var m=c&&c[1];var d=m==='dark'||(m!=='light'&&window.matchMedia('${DARK_MODE_QUERY}').matches);var r=document.documentElement;r.classList.toggle('${DARK_CLASS}',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
