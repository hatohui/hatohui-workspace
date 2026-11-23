import {
  Award,
  Bean,
  Egg,
  Fish,
  Flame,
  Leaf,
  Milk,
  Nut,
  Shell,
  Sprout,
  Wheat,
  type LucideIcon,
} from 'lucide-react';

export const TAG_KIND_NAMESPACE = {
  ALLERGEN: 'allergen',
  SPECIAL: 'special',
  GENERAL: 'tag',
} as const;

export const SPECIAL_ICONS: Partial<Record<string, LucideIcon>> = {
  spicy: Flame,
  vegetarian: Leaf,
  michelin: Award,
};

export const SPECIAL_BADGE_STYLES: Partial<Record<string, string>> = {
  spicy: 'bg-red-500/10 text-red-700 dark:text-red-300',
  vegetarian: 'bg-green-600/10 text-green-800 dark:text-green-300',
  michelin:
    'bg-amber-500/15 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200',
};

export const DEFAULT_SPECIAL_BADGE_STYLE =
  'bg-primary/15 text-[#8f4429] dark:bg-primary/25 dark:text-[#e9a487]';

export const ALLERGEN_ICONS: Partial<Record<string, LucideIcon>> = {
  peanuts: Nut,
  'tree-nuts': Nut,
  shellfish: Shell,
  fish: Fish,
  egg: Egg,
  dairy: Milk,
  gluten: Wheat,
  soy: Bean,
  sesame: Sprout,
};

export const SEARCH_DEBOUNCE_MS = 250;
export const SEARCH_SUGGESTION_LIMIT = 6;
export const MAX_PHOTOS = 12;
export const MAX_CUISINES = 6;
export const MAX_CATEGORIES = 6;
export const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/webp,image/avif,image/gif';
export const CONFLICT_STATUS = 409;

export const APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad/;

export const INITIAL_LOCATION_KEY = 'default';

export const FILTER_CHIP_PREVIEW_LIMIT = 6;

export const CARD_GRID_CLASS =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
