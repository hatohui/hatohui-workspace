import { useCallback, useSyncExternalStore } from 'react';
import { THEME_MODES, type ThemeMode } from './themeConstants';
import {
  getServerThemeMode,
  getThemeMode,
  resolveTheme,
  setThemeMode,
  subscribeTheme,
} from './themeStore';

export function useTheme() {
  const mode = useSyncExternalStore(
    subscribeTheme,
    getThemeMode,
    getServerThemeMode,
  );

  const cycleMode = useCallback(() => {
    const next =
      THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];
    setThemeMode(next);
  }, [mode]);

  return {
    mode,
    resolvedTheme: resolveTheme(mode),
    setMode: (next: ThemeMode) => setThemeMode(next),
    cycleMode,
  };
}
