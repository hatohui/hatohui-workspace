import { Home, LogOut, Settings, SlidersHorizontal, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavIconKey =
  'dashboard' | 'users' | 'systemParameters' | 'settings' | 'logout';

export const navIcons: Record<NavIconKey, LucideIcon> = {
  dashboard: Home,
  users: Users,
  systemParameters: SlidersHorizontal,
  settings: Settings,
  logout: LogOut,
};
