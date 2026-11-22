import { MapPin, Soup, type LucideIcon } from 'lucide-react';

export const FOOD_VIEWS = ['dishes', 'places'] as const;
export type FoodView = (typeof FOOD_VIEWS)[number];

export const FOOD_VIEW_PARAM = 'view';
export const DEFAULT_FOOD_VIEW: FoodView = 'dishes';

export const FOOD_VIEW_OPTIONS: Record<
  FoodView,
  { labelKey: string; searchKey: string; countKey: string; icon: LucideIcon }
> = {
  dishes: {
    labelKey: 'catalog.byDish',
    searchKey: 'dishes.searchPlaceholder',
    countKey: 'catalog.dishTotal',
    icon: Soup,
  },
  places: {
    labelKey: 'catalog.byPlace',
    searchKey: 'places.searchPlaceholder',
    countKey: 'catalog.placeTotal',
    icon: MapPin,
  },
};

export const VEGETARIAN_TAG = 'vegetarian';

export const BROWSE_FOOD_IMAGE_COUNT = 3;
