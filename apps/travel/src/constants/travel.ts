import {
  CreateTravelRecommendationDtoCurrency,
  TravelAllergenTag,
  TravelDietTag,
  TravelPriceLevel,
} from '@hatohui/models';
import {
  Fish,
  Leaf,
  MilkOff,
  Sprout,
  WheatOff,
  type LucideIcon,
} from 'lucide-react';

export const CURRENCIES = Object.values(CreateTravelRecommendationDtoCurrency);
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = 'VND';

export const PRICE_LEVELS = Object.values(TravelPriceLevel);
export const DIET_TAGS = Object.values(TravelDietTag);
export const ALLERGEN_TAGS = Object.values(TravelAllergenTag);

export const DIET_ICONS: Partial<Record<TravelDietTag, LucideIcon>> = {
  vegetarian: Leaf,
  vegan: Sprout,
  pescatarian: Fish,
  'gluten-free': WheatOff,
  'dairy-free': MilkOff,
};

export const PRICE_LEVEL_SYMBOLS: Record<TravelPriceLevel, number> = {
  LOW: 1,
  MID: 2,
  HIGH: 3,
};

export const PRICE_MODES = ['range', 'level'] as const;
export type PriceMode = (typeof PRICE_MODES)[number];

export const SEARCH_DEBOUNCE_MS = 250;
export const MAX_PHOTOS = 12;
export const MAX_CUISINES = 6;
export const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/webp,image/avif,image/gif';
export const CONFLICT_STATUS = 409;

export const PRICE_PRESETS: Record<Currency, [number, number][]> = {
  VND: [
    [20000, 50000],
    [50000, 100000],
    [100000, 200000],
    [200000, 500000],
  ],
  USD: [
    [2, 5],
    [5, 15],
    [15, 30],
    [30, 60],
  ],
  JPY: [
    [500, 1000],
    [1000, 2000],
    [2000, 5000],
    [5000, 10000],
  ],
  EUR: [
    [2, 5],
    [5, 15],
    [15, 30],
    [30, 60],
  ],
  THB: [
    [50, 100],
    [100, 300],
    [300, 600],
    [600, 1500],
  ],
};
