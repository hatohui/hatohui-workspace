import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  useAcceptConnectionRequest,
  useClearNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotifications as useNotificationsQuery,
  useUnreadNotificationCount,
  useWithdrawConnectionRequest,
} from '@hatohui/models';
import { useAuth } from '@hatohui/libs';
import { NOTIFICATIONS_PAGE_SIZE } from '../constants/notifications';
import { invalidateFriendQueries } from './friendQueryClient';

function invalidateInbox(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      (query.queryKey[0].startsWith('/notifications') ||
        query.queryKey[0].startsWith('/connections')),
  });
}

/// The bell only needs the count, so it lives in its own tiny query rather
/// than pulling a page of the feed on every route. Disabled when signed out —
/// otherwise every route change fires a request that can only ever 401.
export function useUnreadCount() {
  const { user } = useAuth();
  const query = useUnreadNotificationCount({
    query: { enabled: user !== null },
  });
  return query.data?.data.count ?? 0;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useNotificationsQuery({
    page,
    pageSize: NOTIFICATIONS_PAGE_SIZE,
  });

  const onSettled = {
    onSuccess: async () => {
      setPage(1);
      await invalidateInbox(queryClient);
      await invalidateFriendQueries(queryClient);
    },
  };

  const accept = useAcceptConnectionRequest({ mutation: onSettled });
  const decline = useWithdrawConnectionRequest({ mutation: onSettled });
  const markAllRead = useMarkAllNotificationsRead({
    mutation: { onSuccess: () => invalidateInbox(queryClient) },
  });
  const deleteOne = useDeleteNotification({
    mutation: {
      onSuccess: async () => {
        setPage(1);
        await invalidateInbox(queryClient);
      },
    },
  });
  const clearHistory = useClearNotifications({
    mutation: {
      onSuccess: async () => {
        setPage(1);
        await invalidateInbox(queryClient);
      },
    },
  });

  const total = query.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / NOTIFICATIONS_PAGE_SIZE));

  return {
    items: query.data?.data.items ?? [],
    unreadCount: query.data?.data.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    isActing: accept.isPending || decline.isPending,
    isDeleting: deleteOne.isPending || clearHistory.isPending,
    accept: (connectionId: string) => accept.mutate({ id: connectionId }),
    decline: (connectionId: string) => decline.mutate({ id: connectionId }),
    markAllRead: () => markAllRead.mutate(),
    deleteNotification: (id: string) => deleteOne.mutate({ id }),
    clearHistory: () => clearHistory.mutate(),
  };
}
