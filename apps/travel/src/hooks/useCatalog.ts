import { useState } from 'react';
import { useTravelRecommendations } from '@hatohui/models';
import { useSearchState } from './useSearchState';

export function useCatalog() {
  const { search, setSearch, query } = useSearchState();
  const [spicy, setSpicy] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);

  const result = useTravelRecommendations({
    q: query,
    spicy: spicy || undefined,
    vegetarian: vegetarian || undefined,
  });

  const isFiltered = Boolean(query) || spicy || vegetarian;
  const clearFilters = () => {
    setSearch('');
    setSpicy(false);
    setVegetarian(false);
  };

  return {
    recommendations: result.data?.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    filters: { search, setSearch, spicy, setSpicy, vegetarian, setVegetarian },
    isFiltered,
    clearFilters,
  };
}
