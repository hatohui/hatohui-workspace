import { CreateTravelRecommendationDtoCurrency } from '@hatohui/models';

export const CURRENCIES = Object.values(CreateTravelRecommendationDtoCurrency);
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = 'VND';

export const SEARCH_DEBOUNCE_MS = 250;
export const MAX_PHOTOS = 12;
export const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/webp,image/avif,image/gif';
export const CONFLICT_STATUS = 409;

export const ESTIMATE_PRESETS: Record<Currency, number[]> = {
  VND: [30000, 50000, 100000, 200000],
  USD: [5, 10, 20, 50],
  JPY: [800, 1500, 3000, 6000],
  EUR: [5, 10, 20, 50],
  THB: [60, 150, 300, 600],
};
