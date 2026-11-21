import { useState } from 'react';
import {
  useTravelRecommendations,
  type TravelAllergenTag,
  type TravelDietTag,
} from '@hatohui/models';
import { useSearchState } from './useSearchState';

const toggled = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export function useCatalog() {
  const { search, setSearch, query } = useSearchState();
  const [spicy, setSpicy] = useState(false);
  const [diets, setDiets] = useState<TravelDietTag[]>([]);
  const [avoid, setAvoid] = useState<TravelAllergenTag[]>([]);

  const result = useTravelRecommendations({
    q: query,
    spicy: spicy || undefined,
    diets: diets.length ? diets : undefined,
    excludeAllergens: avoid.length ? avoid : undefined,
  });

  const isFiltered =
    Boolean(query) || spicy || diets.length > 0 || avoid.length > 0;
  const clearFilters = () => {
    setSearch('');
    setSpicy(false);
    setDiets([]);
    setAvoid([]);
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
      toggleDiet: (tag: TravelDietTag) =>
        setDiets((list) => toggled(list, tag)),
      avoid,
      toggleAvoid: (tag: TravelAllergenTag) =>
        setAvoid((list) => toggled(list, tag)),
    },
    isFiltered,
    clearFilters,
  };
}
