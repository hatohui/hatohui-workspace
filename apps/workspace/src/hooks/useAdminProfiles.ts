import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@hatohui/libs';
import {
  getAdminListProfilesQueryKey,
  useAdminListProfiles,
  useAdminUpdateProfile,
} from '@hatohui/models';
import type {
  PaginatedAdminProfilesDto,
  UpdateAdminProfileDto,
} from '@hatohui/models';
import { ADMIN_PROFILES_PAGE_SIZE } from '../constants/admin';

export function useAdminProfiles() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'createdAt'>('name');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const debouncedSearch = useDebouncedValue(search, 300);
  const queryClient = useQueryClient();

  const params = {
    query: debouncedSearch || undefined,
    sort,
    direction,
    page,
    pageSize: ADMIN_PROFILES_PAGE_SIZE,
  };
  const queryKey = getAdminListProfilesQueryKey(params);
  const query = useAdminListProfiles(params);
  const updateMutation = useAdminUpdateProfile();

  const updateField = (
    id: string,
    key: keyof UpdateAdminProfileDto,
    value: string,
  ) => {
    const previous = queryClient.getQueryData<{
      data: PaginatedAdminProfilesDto;
    }>(queryKey);

    if (previous) {
      queryClient.setQueryData(queryKey, {
        ...previous,
        data: {
          ...previous.data,
          items: previous.data.items.map((item) =>
            item.id === id ? { ...item, [key]: value } : item,
          ),
        },
      });
    }

    updateMutation.mutate(
      { id, data: { [key]: value } },
      {
        onError: () => {
          if (previous) queryClient.setQueryData(queryKey, previous);
        },
        onSettled: () => {
          void query.refetch();
        },
      },
    );
  };

  return {
    profiles: query.data?.data.items ?? [],
    isLoading: query.isPending,
    updateField,
    page,
    setPage: (next: number) => setPage(next),
    hasMore: query.data?.data.hasMore ?? false,
    total: query.data?.data.total ?? 0,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    sort,
    direction,
    onHeaderSort: (key: 'name' | 'createdAt') => {
      setDirection((prevDirection) =>
        sort === key && prevDirection === 'asc' ? 'desc' : 'asc',
      );
      setSort(key);
      setPage(1);
    },
  };
}
