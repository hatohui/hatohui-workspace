import { useQueryClient } from '@tanstack/react-query';
import {
  getNotificationsQueryKey,
  getUnreadNotificationCountQueryKey,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@hatohui/models';

export function useTravelNotifications(enabled: boolean) {
  const queryClient = useQueryClient();
  const listQuery = useNotifications(
    { page: 1, pageSize: 20 },
    { query: { enabled } },
  );
  const unreadQuery = useUnreadNotificationCount({ query: { enabled } });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getNotificationsQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: getUnreadNotificationCountQueryKey(),
      }),
    ]);
  };

  const markRead = async (id: string) => {
    await markReadMutation.mutateAsync({ id });
    await invalidate();
  };

  const markAllRead = async () => {
    await markAllMutation.mutateAsync();
    await invalidate();
  };

  const items = (listQuery.data?.data.items ?? []).filter((item) =>
    item.type.startsWith('TRAVEL_'),
  );

  return {
    items,
    unreadCount: unreadQuery.data?.data.count ?? 0,
    isLoading: listQuery.isLoading,
    markRead,
    markAllRead,
  };
}
