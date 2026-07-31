import { Cake, Home, LogOut, Settings, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavIconKey = 'home' | 'cake' | 'userPlus' | 'settings' | 'logout';

export const navIcons: Record<NavIconKey, LucideIcon> = {
  home: Home,
  cake: Cake,
  userPlus: UserPlus,
  settings: Settings,
  logout: LogOut,
};
