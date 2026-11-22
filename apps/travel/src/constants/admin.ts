import {
  Briefcase,
  CalendarRange,
  ChefHat,
  Globe,
  MapPin,
  Plane,
  Soup,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export const QUICK_ADD_SEPARATOR = /[,\n]/;
export const CUISINE_LIST_SEPARATOR = ',';
export const ADMIN_PAGE_SIZES = [20, 50, 100] as const;
export const DEFAULT_ADMIN_PAGE_SIZE = 20;

export const ADMIN_TABS = [
  'recommendations',
  'countries',
  'areas',
  'dishes',
  'cuisines',
  'tags',
  'events',
  'plans',
  'jobProfiles',
] as const;
export const TAG_KINDS = ['DIET', 'ALLERGEN', 'GENERAL'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

export const ADMIN_TAB_ICONS: Record<AdminTab, LucideIcon> = {
  recommendations: UtensilsCrossed,
  countries: Globe,
  areas: MapPin,
  dishes: Soup,
  cuisines: ChefHat,
  tags: Tag,
  events: CalendarRange,
  plans: Plane,
  jobProfiles: Briefcase,
};
