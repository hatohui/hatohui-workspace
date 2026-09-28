import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import type { ThemeMode } from './themeConstants';

export const themeIcons: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};
