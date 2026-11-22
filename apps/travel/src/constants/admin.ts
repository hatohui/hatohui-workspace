import {
  ChefHat,
  Globe,
  MapPin,
  Soup,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export const QUICK_ADD_SEPARATOR = /[,\n]/;
export const CUISINE_LIST_SEPARATOR = ',';

export const ADMIN_TABS = [
  'recommendations',
  'countries',
  'areas',
  'dishes',
  'cuisines',
  'tags',
] as const;
export const TAG_KINDS = ['DIET', 'ALLERGEN'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

export const ADMIN_TAB_ICONS: Record<AdminTab, LucideIcon> = {
  recommendations: UtensilsCrossed,
  countries: Globe,
  areas: MapPin,
  dishes: Soup,
  cuisines: ChefHat,
  tags: Tag,
};
