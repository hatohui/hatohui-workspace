import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@hatohui/libs';
import {
  getAdminTravelGroupsQueryKey,
  getAdminTravelStatsQueryKey,
  useAdminDeleteTravelGroup,
  useAdminTravelGroups,
  useAdminTravelStats,
  type TravelAdminGroupItemDto,
} from '@hatohui/models';

export function useAdminPlans() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [deleting, setDeleting] = useState<TravelAdminGroupItemDto | null>(
    null,
  );

  const statsQuery = useAdminTravelStats();
  const groupsQuery = useAdminTravelGroups({
    q: debouncedSearch.trim() || undefined,
  });
  const deleteMutation = useAdminDeleteTravelGroup();

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteMutation.mutateAsync({ id: deleting.id });
    setDeleting(null);
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getAdminTravelGroupsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getAdminTravelStatsQueryKey(),
      }),
    ]);
  };

  return {
    search,
    setSearch,
    stats: statsQuery.data?.data ?? null,
    groups: groupsQuery.data?.data.groups ?? [],
    total: groupsQuery.data?.data.total ?? 0,
    isLoading: groupsQuery.isLoading,
    deleting,
    setDeleting,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
