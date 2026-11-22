import type { TravelCatalogSort } from '@hatohui/models';
import { MapPin, Soup, type LucideIcon } from 'lucide-react';

export const FOOD_VIEWS = ['dishes', 'places'] as const;
export type FoodView = (typeof FOOD_VIEWS)[number];

export const FOOD_VIEW_PARAM = 'view';
export const DEFAULT_FOOD_VIEW: FoodView = 'dishes';
export const FOOD_GROUP_PARAM = 'group';
export const FOOD_GROUP_CATEGORY = 'category';

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

export const BROWSE_FOOD_IMAGE_COUNT = 3;

export const DEFAULT_CATALOG_SORT: TravelCatalogSort = 'relevance';

export const CATALOG_SORT_OPTIONS: Record<
  FoodView,
  { value: TravelCatalogSort; labelKey: string }[]
> = {
  dishes: [
    { value: 'relevance', labelKey: 'catalog.sort.relevance' },
    { value: 'popular', labelKey: 'catalog.sort.popularDishes' },
    { value: 'newest', labelKey: 'catalog.sort.newest' },
    { value: 'oldest', labelKey: 'catalog.sort.oldest' },
    { value: 'name', labelKey: 'catalog.sort.name' },
  ],
  places: [
    { value: 'relevance', labelKey: 'catalog.sort.relevance' },
    { value: 'popular', labelKey: 'catalog.sort.popularPlaces' },
    { value: 'newest', labelKey: 'catalog.sort.newest' },
    { value: 'oldest', labelKey: 'catalog.sort.oldest' },
    { value: 'name', labelKey: 'catalog.sort.name' },
  ],
};

export const CATALOG_PAGE_PARAM = 'page';
