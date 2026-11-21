import { useState } from 'react';
import { useTravelRecommendations } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import { SEARCH_DEBOUNCE_MS } from '../constants/travel';
import { useSearchState } from './useSearchState';
import { useTravelLocation } from './useTravelLocation';

const toggled = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

const listOrUndefined = <T>(list: T[]) => (list.length ? list : undefined);

export function useCatalog() {
  const { search, setSearch, query } = useSearchState();
  const location = useTravelLocation();
  const [spicy, setSpicy] = useState(false);
  const [diets, setDiets] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [by, setBy] = useState('');
  const debouncedBy = useDebouncedValue(by.trim(), SEARCH_DEBOUNCE_MS);

  const result = useTravelRecommendations({
    q: query,
    spicy: spicy || undefined,
    diets: listOrUndefined(diets),
    excludeAllergens: listOrUndefined(avoid),
    cuisines: listOrUndefined(cuisines),
    by: debouncedBy || undefined,
    ...location.filter,
  });

  const activeCount =
    Number(spicy) +
    diets.length +
    avoid.length +
    cuisines.length +
    Number(Boolean(by.trim()));

  const clearFilters = () => {
    setSearch('');
    setSpicy(false);
    setDiets([]);
    setAvoid([]);
    setCuisines([]);
    setBy('');
  };

  return {
    recommendations: result.data?.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    filters: {
      search,
      setSearch,
      spicy,
      setSpicy,
      diets,
      toggleDiet: (tag: string) => setDiets((l) => toggled(l, tag)),
      avoid,
      toggleAvoid: (tag: string) => setAvoid((l) => toggled(l, tag)),
      cuisines,
      toggleCuisine: (name: string) => setCuisines((l) => toggled(l, name)),
      by,
      setBy,
      activeCount,
      clearFilters,
    },
    isFiltered: Boolean(query) || activeCount > 0,
  };
}

export type CatalogFilters = ReturnType<typeof useCatalog>['filters'];
