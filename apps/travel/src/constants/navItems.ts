import {
  CalendarDays,
  CalendarRange,
  Compass,
  Plane,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import routes from './routes';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: routes.overview, labelKey: 'nav.overview', icon: Compass },
  { to: routes.catalog, labelKey: 'nav.food', icon: UtensilsCrossed },
  { to: routes.events, labelKey: 'nav.events', icon: CalendarRange },
  { to: routes.plans, labelKey: 'nav.plans', icon: Plane },
  { to: routes.schedule, labelKey: 'nav.schedule', icon: CalendarDays },
];
