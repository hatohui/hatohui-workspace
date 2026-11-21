import { MapPin, Soup, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import routes from './routes';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: routes.catalog, labelKey: 'nav.food', icon: UtensilsCrossed },
  { to: routes.dishes, labelKey: 'nav.dishes', icon: Soup },
  { to: routes.places, labelKey: 'nav.places', icon: MapPin },
];
