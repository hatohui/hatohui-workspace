import { useState } from 'react';
import type {
  TravelPriceLevel,
  TravelRecommendationDto,
} from '@hatohui/models';
import {
  DEFAULT_CURRENCY,
  type Currency,
  type PriceMode,
} from '../constants/travel';

export interface RecommendationFields {
  dishName: string;
  cuisines: string[];
  placeName: string;
  mapsUrl: string;
  priceMode: PriceMode;
  priceMin: string;
  priceMax: string;
  priceLevel: TravelPriceLevel | null;
  currency: Currency;
  note: string;
  spicy: boolean;
  diets: string[];
  allergens: string[];
  tags: string[];
}

const amount = (value: number | null | undefined) =>
  value == null ? '' : String(value);

const fieldsFrom = (rec?: TravelRecommendationDto): RecommendationFields => ({
  dishName: rec?.dish.name ?? '',
  cuisines: rec?.dish.cuisines ?? [],
  placeName: rec?.place.name ?? '',
  mapsUrl: rec?.place.mapsUrl ?? '',
  priceMode: rec?.priceLevel && rec.priceMin == null ? 'level' : 'range',
  priceMin: amount(rec?.priceMin),
  priceMax: rec?.priceMax === rec?.priceMin ? '' : amount(rec?.priceMax),
  priceLevel: rec?.priceLevel ?? null,
  currency: (rec?.currency as Currency | undefined) ?? DEFAULT_CURRENCY,
  note: rec?.note ?? '',
  spicy: rec?.spicy ?? false,
  diets: rec?.diets ?? [],
  allergens: rec?.allergens ?? [],
  tags: rec?.tags ?? [],
});

export function useRecommendationFields(rec?: TravelRecommendationDto) {
  const [fields, setFields] = useState(() => fieldsFrom(rec));
  const set = <K extends keyof RecommendationFields>(
    key: K,
    value: RecommendationFields[K],
  ) => setFields((current) => ({ ...current, [key]: value }));
  const toggle = <K extends 'diets' | 'allergens'>(
    key: K,
    tag: RecommendationFields[K][number],
  ) =>
    setFields((current) => {
      const list = current[key] as string[];
      const next = list.includes(tag)
        ? list.filter((item) => item !== tag)
        : [...list, tag];
      return { ...current, [key]: next };
    });
  return { fields, set, toggle };
}
