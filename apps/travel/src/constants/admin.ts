import {
  Briefcase,
  CalendarRange,
  ChefHat,
  Compass,
  Globe,
  Layers,
  MapPin,
  MapPinned,
  Plane,
  Shapes,
  Soup,
  Store,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export const QUICK_ADD_SEPARATOR = /[,\n]/;
export const CUISINE_LIST_SEPARATOR = ',';
export const ADMIN_AUTO_PAGE_SIZE = 'auto';
export type AdminPageSize = number | typeof ADMIN_AUTO_PAGE_SIZE;
export const ADMIN_PAGE_SIZES = [ADMIN_AUTO_PAGE_SIZE, 20, 50, 100] as const;
export const DEFAULT_ADMIN_PAGE_SIZE: AdminPageSize = ADMIN_AUTO_PAGE_SIZE;
export const ADMIN_FALLBACK_PAGE_SIZE = 20;
export const ADMIN_AUTO_MIN_ROWS = 5;
export const ADMIN_ROW_HEIGHT_FALLBACK = 45;
export const ADMIN_HEADER_HEIGHT_FALLBACK = 37;
export const ADMIN_TABLE_BOTTOM_SPACE = 88;

export const ADMIN_FILTER_EMPTY = '__empty';
export const ADMIN_FILTER_NONE = '__none';
export const ADMIN_FILTER_SOME = '__some';

export const ADMIN_TABS = [
  'recommendations',
  'countries',
  'areas',
  'dishes',
  'foodCategories',
  'places',
  'placeCategories',
  'spots',
  'spotCategories',
  'cuisines',
  'tags',
  'events',
  'plans',
  'jobProfiles',
] as const;
export const TAG_KINDS = ['ALLERGEN', 'SPECIAL', 'GENERAL'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

export const ADMIN_TAB_ICONS: Record<AdminTab, LucideIcon> = {
  recommendations: UtensilsCrossed,
  countries: Globe,
  areas: MapPin,
  dishes: Soup,
  foodCategories: Layers,
  places: Store,
  placeCategories: Shapes,
  spots: MapPinned,
  spotCategories: Compass,
  cuisines: ChefHat,
  tags: Tag,
  events: CalendarRange,
  plans: Plane,
  jobProfiles: Briefcase,
};

export const ADMIN_RECOMMENDATION_GRID_CLASS =
  'grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
