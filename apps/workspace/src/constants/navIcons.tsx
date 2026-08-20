import {
  Cake,
  Home,
  LogOut,
  Settings,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavIconKey =
  | 'dashboard'
  | 'users'
  | 'profiles'
  | 'systemParameters'
  | 'settings'
  | 'logout';

export const navIcons: Record<NavIconKey, LucideIcon> = {
  dashboard: Home,
  users: Users,
  profiles: Cake,
  systemParameters: SlidersHorizontal,
  settings: Settings,
  logout: LogOut,
};
