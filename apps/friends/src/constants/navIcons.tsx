import {
  Bell,
  Cake,
  Home,
  Languages,
  LogOut,
  Network,
  Settings,
  User,
  UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavIconKey =
  | 'home'
  | 'cake'
  | 'userPlus'
  | 'settings'
  | 'language'
  | 'logout'
  | 'social'
  | 'user'
  | 'bell';

export const navIcons: Record<NavIconKey, LucideIcon> = {
  home: Home,
  cake: Cake,
  userPlus: UserPlus,
  settings: Settings,
  language: Languages,
  logout: LogOut,
  social: Network,
  user: User,
  bell: Bell,
};
