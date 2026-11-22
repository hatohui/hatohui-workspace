import { useMemo } from 'react';
import { useTravelRecommendations } from '@hatohui/models';
import { usePagination } from './usePagination';
import { useResponsiveGridCount } from './useResponsiveGridCount';
import { useSearchState } from './useSearchState';

export function useAdminRecommendations() {
  const { search, setSearch, query } = useSearchState();
  const pageSize = useResponsiveGridCount('adminCards');
  const result = useTravelRecommendations({ q: query });
  const items = useMemo(() => result.data?.data ?? [], [result.data?.data]);
  const pagination = usePagination(items, query, pageSize);

  return {
    search,
    setSearch,
    recommendations: pagination.pagedItems,
    pagination,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
    isFiltered: Boolean(query),
  };
}
