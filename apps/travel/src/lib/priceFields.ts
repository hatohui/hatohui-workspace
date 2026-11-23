import type { TravelPriceLevel } from '@hatohui/models';
import type { Currency, PriceMode } from '../constants/travel';

export interface PriceFields {
  priceMode: PriceMode;
  priceMin: string;
  priceMax: string;
  priceLevel: TravelPriceLevel | null;
  currency: Currency;
}

export type SetPriceField = <K extends keyof PriceFields>(
  key: K,
  value: PriceFields[K],
) => void;
