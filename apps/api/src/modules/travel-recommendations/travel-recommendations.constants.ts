export const TRAVEL_NAME_MAX_LENGTH = 120;
export const TRAVEL_NOTE_MAX_LENGTH = 2000;
export const TRAVEL_URL_MAX_LENGTH = 2000;
export const TRAVEL_MAX_IMAGES = 12;
export const TRAVEL_MAX_CUISINES = 6;
export const TRAVEL_MAX_CATEGORIES = 6;
export const TRAVEL_MAX_TAGS = 16;
export const TRAVEL_CATALOG_LIMIT = 500;
export const TRAVEL_DEFAULT_CURRENCY = 'VND';
export const TRAVEL_CURRENCIES = ['VND', 'USD', 'JPY', 'EUR', 'THB'] as const;
export type TravelCurrency = (typeof TRAVEL_CURRENCIES)[number];
export const UNIQUE_VIOLATION_CODE = 'P2002';

export const TRAVEL_PRICE_LEVELS = ['LOW', 'MID', 'HIGH'] as const;

export const TRAVEL_BULK_MAX_ITEMS = 50;
export const TRAVEL_COUNTRY_CODE_PATTERN = /^([A-Za-z]{2})?$/;

export const TRAVEL_CATALOG_SORTS = [
  'relevance',
  'newest',
  'oldest',
  'name',
  'popular',
] as const;
export type TravelCatalogSort = (typeof TRAVEL_CATALOG_SORTS)[number];
