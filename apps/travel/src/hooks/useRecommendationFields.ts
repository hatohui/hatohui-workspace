import { useState } from 'react';
import type {
  TravelAllergenTag,
  TravelDietTag,
  TravelPriceLevel,
  TravelRecommendationDto,
  TravelSpiceLevel,
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
  spiceLevel: TravelSpiceLevel;
  diets: TravelDietTag[];
  allergens: TravelAllergenTag[];
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
  spiceLevel: rec?.spiceLevel ?? 'NONE',
  diets: rec?.diets ?? [],
  allergens: rec?.allergens ?? [],
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
