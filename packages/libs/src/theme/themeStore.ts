import {
  DARK_CLASS,
  DARK_MODE_QUERY,
  THEME_MODES,
  type ResolvedTheme,
  type ThemeMode,
} from './themeConstants';
import { readThemeCookie, writeThemeCookie } from './themeCookie';

const listeners = new Set<() => void>();

function isThemeMode(value: string | null): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}

function readStoredMode(): ThemeMode {
  const stored = readThemeCookie();
  return isThemeMode(stored) ? stored : 'system';
}

let currentMode: ThemeMode =
  typeof window === 'undefined' ? 'system' : readStoredMode();

function prefersDark(): boolean {
  return window.matchMedia(DARK_MODE_QUERY).matches;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== 'system') return mode;
  return typeof window !== 'undefined' && prefersDark() ? 'dark' : 'light';
}

function applyTheme(): void {
  const resolved = resolveTheme(currentMode);
  const root = document.documentElement;
  root.classList.toggle(DARK_CLASS, resolved === 'dark');
  root.style.colorScheme = resolved;
  listeners.forEach((listener) => listener());
}

function syncFromCookie(): void {
  const stored = readStoredMode();
  if (stored === currentMode) return;
  currentMode = stored;
  applyTheme();
}

export function getThemeMode(): ThemeMode {
  return currentMode;
}

export function getServerThemeMode(): ThemeMode {
  return 'system';
}

export function setThemeMode(mode: ThemeMode): void {
  currentMode = mode;
  writeThemeCookie(mode);
  applyTheme();
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia(DARK_MODE_QUERY);
  const handleSystemChange = () => {
    if (currentMode === 'system') applyTheme();
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') syncFromCookie();
  };
  media.addEventListener('change', handleSystemChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', syncFromCookie);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', handleSystemChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', syncFromCookie);
  };
}
