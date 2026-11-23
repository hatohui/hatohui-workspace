import { useState } from 'react';
import type {
  TravelDishSummaryDto,
  TravelRecommendationDto,
} from '@hatohui/models';
import { sameCatalogName } from '../lib/catalogName';

export interface DishLine {
  key: string;
  name: string;
  picked: TravelDishSummaryDto | null;
  cuisines: string[];
  foodCategories: string[];
  allergens: string[];
}

export interface RecommendationFields {
  placeName: string;
  placeCategories: string[];
  areaId: string;
  mapsUrl: string;
  note: string;
  specials: string[];
  tags: string[];
}

export const pickedDishOf = (line: DishLine) =>
  line.picked && sameCatalogName(line.picked.name, line.name)
    ? line.picked
    : null;

export const emptyDishLine = (name = ''): DishLine => ({
  key: crypto.randomUUID(),
  name,
  picked: null,
  cuisines: [],
  foodCategories: [],
  allergens: [],
});

const linesFrom = (
  rec?: TravelRecommendationDto,
  initialDishName?: string,
): DishLine[] =>
  rec
    ? rec.dishes.map((line) => ({
        key: line.id,
        name: line.dish.name,
        picked: line.dish,
        cuisines: line.dish.cuisines,
        foodCategories: line.dish.categories,
        allergens: line.allergens,
      }))
    : [emptyDishLine(initialDishName)];

const fieldsFrom = (
  rec?: TravelRecommendationDto,
  defaultAreaId?: string,
): RecommendationFields => ({
  placeName: rec?.place.name ?? '',
  placeCategories: rec?.place.categories ?? [],
  areaId: rec?.place.area?.id ?? defaultAreaId ?? '',
  mapsUrl: rec?.place.mapsUrl ?? '',
  note: rec?.note ?? '',
  specials: rec?.specials ?? [],
  tags: rec?.tags ?? [],
});

export function useRecommendationFields(
  rec?: TravelRecommendationDto,
  defaultAreaId?: string,
  initialDishName?: string,
) {
  const [fields, setFields] = useState(() => fieldsFrom(rec, defaultAreaId));
  const [lines, setLines] = useState(() => linesFrom(rec, initialDishName));

  const set = <K extends keyof RecommendationFields>(
    key: K,
    value: RecommendationFields[K],
  ) => setFields((current) => ({ ...current, [key]: value }));

  const updateLine = (key: string, patch: Partial<DishLine>) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  return {
    fields,
    set,
    lines,
    updateLine,
    addLine: () => setLines((current) => [...current, emptyDishLine()]),
    removeLine: (key: string) =>
      setLines((current) =>
        current.length > 1
          ? current.filter((line) => line.key !== key)
          : [emptyDishLine()],
      ),
  };
}
