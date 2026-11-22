import { useState } from 'react';
import { useDebouncedValue } from '@hatohui/libs';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import { useMyAllergies } from './useMyAllergies';
import { useSearchState } from './useSearchState';

const toggled = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

const listOrUndefined = <T>(list: T[]) => (list.length ? list : undefined);

export function useTravelFilterState() {
  const { search, setSearch, query } = useSearchState();
  const [spicy, setSpicy] = useState(false);
  const [diets, setDiets] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [by, setBy] = useState('');
  const [hideMine, setHideMine] = useState(false);
  const mine = useMyAllergies();
  const excluded = hideMine
    ? [...new Set([...avoid, ...mine.allergens])]
    : avoid;
  const debouncedBy = useDebouncedValue(by.trim(), SEARCH_DEBOUNCE_MS);

  const activeCount =
    Number(spicy) +
    diets.length +
    avoid.length +
    tags.length +
    cuisines.length +
    Number(Boolean(by.trim())) +
    Number(hideMine);

  const clearFilters = () => {
    setSearch('');
    setSpicy(false);
    setDiets([]);
    setAvoid([]);
    setTags([]);
    setCuisines([]);
    setBy('');
    setHideMine(false);
  };

  return {
    queryParams: {
      q: query,
      spicy: spicy || undefined,
      diets: listOrUndefined(diets),
      excludeAllergens: listOrUndefined(excluded),
      tags: listOrUndefined(tags),
      cuisines: listOrUndefined(cuisines),
      by: debouncedBy || undefined,
    },
    filters: {
      search,
      setSearch,
      spicy,
      setSpicy,
      diets,
      toggleDiet: (tag: string) => setDiets((l) => toggled(l, tag)),
      avoid,
      toggleAvoid: (tag: string) => setAvoid((l) => toggled(l, tag)),
      tags,
      toggleTag: (tag: string) => setTags((l) => toggled(l, tag)),
      cuisines,
      toggleCuisine: (name: string) => setCuisines((l) => toggled(l, name)),
      by,
      setBy,
      hideMine,
      setHideMine,
      myAllergenCount: mine.allergens.length,
      activeCount,
      clearFilters,
    },
    isFiltered: Boolean(query) || activeCount > 0,
  };
}

export type TravelFilterState = ReturnType<typeof useTravelFilterState>;
export type CatalogFilters = TravelFilterState['filters'];
