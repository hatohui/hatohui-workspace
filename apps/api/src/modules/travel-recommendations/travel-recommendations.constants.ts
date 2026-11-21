export const TRAVEL_NAME_MAX_LENGTH = 120;
export const TRAVEL_NOTE_MAX_LENGTH = 2000;
export const TRAVEL_URL_MAX_LENGTH = 2000;
export const TRAVEL_MAX_IMAGES = 12;
export const TRAVEL_MAX_CUISINES = 6;
export const TRAVEL_CATALOG_LIMIT = 500;
export const TRAVEL_DEFAULT_CURRENCY = 'VND';
export const TRAVEL_CURRENCIES = ['VND', 'USD', 'JPY', 'EUR', 'THB'] as const;
export type TravelCurrency = (typeof TRAVEL_CURRENCIES)[number];
export const UNIQUE_VIOLATION_CODE = 'P2002';

export const TRAVEL_SPICE_LEVELS = ['NONE', 'MILD', 'MEDIUM', 'HOT'] as const;
export const TRAVEL_PRICE_LEVELS = ['LOW', 'MID', 'HIGH'] as const;

export const TRAVEL_DIET_TAGS = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
  'kosher',
  'gluten-free',
  'dairy-free',
] as const;

export const TRAVEL_ALLERGEN_TAGS = [
  'peanuts',
  'tree-nuts',
  'shellfish',
  'fish',
  'egg',
  'dairy',
  'gluten',
  'soy',
  'sesame',
] as const;

export type TravelDietTag = (typeof TRAVEL_DIET_TAGS)[number];
export type TravelAllergenTag = (typeof TRAVEL_ALLERGEN_TAGS)[number];
