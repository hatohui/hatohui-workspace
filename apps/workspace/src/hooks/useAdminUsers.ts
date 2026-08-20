import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@hatohui/libs';
import {
  getAdminListUsersQueryKey,
  useAdminListUsers,
  useAdminUpdateUser,
} from '@hatohui/models';
import type {
  AdminListUsersOnboardingStatus,
  PaginatedAdminUsersDto,
  UpdateAdminUserDto,
} from '@hatohui/models';
import {
  ADMIN_USERS_PAGE_SIZE,
  type AdminSortDirection,
  type AdminUserSortOption,
} from '../constants/admin';

export function useAdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [onboardingStatus, setOnboardingStatus] = useState<
    AdminListUsersOnboardingStatus | undefined
  >(undefined);
  const [sort, setSort] = useState<AdminUserSortOption>('createdAt');
  const [direction, setDirection] = useState<AdminSortDirection>('desc');
  const debouncedSearch = useDebouncedValue(search, 300);
  const queryClient = useQueryClient();

  const params = {
    query: debouncedSearch || undefined,
    onboardingStatus,
    sort,
    direction,
    page,
    pageSize: ADMIN_USERS_PAGE_SIZE,
  };
  const queryKey = getAdminListUsersQueryKey(params);
  const query = useAdminListUsers(params);
  const updateMutation = useAdminUpdateUser();

  const updateField = (
    id: string,
    key: keyof UpdateAdminUserDto,
    value: string,
  ) => {
    const previous = queryClient.getQueryData<{ data: PaginatedAdminUsersDto }>(
      queryKey,
    );

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
    users: query.data?.data.items ?? [],
    isLoading: query.isPending,
    error: query.error,
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
    onboardingStatus,
    setOnboardingStatus: (
      value: AdminListUsersOnboardingStatus | undefined,
    ) => {
      setOnboardingStatus(value);
      setPage(1);
    },
    sort,
    direction,
    onHeaderSort: (key: AdminUserSortOption) => {
      setDirection((prevDirection) =>
        sort === key && prevDirection === 'asc' ? 'desc' : 'asc',
      );
      setSort(key);
      setPage(1);
    },
  };
}
