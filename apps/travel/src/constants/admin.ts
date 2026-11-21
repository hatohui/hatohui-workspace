export const QUICK_ADD_SEPARATOR = /[,\n]/;
export const CUISINE_LIST_SEPARATOR = ',';

export const ADMIN_TABS = [
  'countries',
  'areas',
  'dishes',
  'cuisines',
  'tags',
] as const;
export const TAG_KINDS = ['DIET', 'ALLERGEN'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];
