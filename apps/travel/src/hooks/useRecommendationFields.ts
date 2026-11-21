import { useState } from 'react';
import type { TravelRecommendationDto } from '@hatohui/models';
import { DEFAULT_CURRENCY, type Currency } from '../constants/travel';

export interface RecommendationFields {
  dishName: string;
  cuisine: string;
  placeName: string;
  mapsUrl: string;
  estimate: string;
  currency: Currency;
  note: string;
  spicy: boolean;
  vegetarian: boolean;
}

const fieldsFrom = (rec?: TravelRecommendationDto): RecommendationFields => ({
  dishName: rec?.dish.name ?? '',
  cuisine: rec?.dish.cuisine ?? '',
  placeName: rec?.place.name ?? '',
  mapsUrl: rec?.place.mapsUrl ?? '',
  estimate: rec?.estimate == null ? '' : String(rec.estimate),
  currency: (rec?.currency as Currency | undefined) ?? DEFAULT_CURRENCY,
  note: rec?.note ?? '',
  spicy: rec?.spicy ?? false,
  vegetarian: rec?.vegetarian ?? false,
});

export function useRecommendationFields(rec?: TravelRecommendationDto) {
  const [fields, setFields] = useState(() => fieldsFrom(rec));
  const set = <K extends keyof RecommendationFields>(
    key: K,
    value: RecommendationFields[K],
  ) => setFields((current) => ({ ...current, [key]: value }));
  return { fields, set, reset: () => setFields(fieldsFrom(rec)) };
}
