import { useQueryClient } from '@tanstack/react-query';
import {
  useAcceptConnectionRequest,
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
  const query = useNotificationsQuery({
    page: 1,
    pageSize: NOTIFICATIONS_PAGE_SIZE,
  });

  const onSettled = {
    onSuccess: async () => {
      await invalidateInbox(queryClient);
      await invalidateFriendQueries(queryClient);
    },
  };

  const accept = useAcceptConnectionRequest({ mutation: onSettled });
  const decline = useWithdrawConnectionRequest({ mutation: onSettled });
  const markAllRead = useMarkAllNotificationsRead({
    mutation: { onSuccess: () => invalidateInbox(queryClient) },
  });

  return {
    items: query.data?.data.items ?? [],
    unreadCount: query.data?.data.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isActing: accept.isPending || decline.isPending,
    accept: (connectionId: string) => accept.mutate({ id: connectionId }),
    decline: (connectionId: string) => decline.mutate({ id: connectionId }),
    markAllRead: () => markAllRead.mutate(),
  };
}
