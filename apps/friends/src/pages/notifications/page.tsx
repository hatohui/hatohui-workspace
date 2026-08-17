import RequireAuth from '../../components/auth/RequireAuth';
import NotificationList from '../../components/notifications/NotificationList';
import { useNotifications } from '../../hooks/useNotifications';

function NotificationsPage() {
  const notifications = useNotifications();

  return (
    <RequireAuth>
      <NotificationList
        items={notifications.items}
        unreadCount={notifications.unreadCount}
        isLoading={notifications.isLoading}
        isError={notifications.isError}
        isActing={notifications.isActing}
        isDeleting={notifications.isDeleting}
        page={notifications.page}
        totalPages={notifications.totalPages}
        hasNextPage={notifications.hasNextPage}
        hasPrevPage={notifications.hasPrevPage}
        onAccept={notifications.accept}
        onDecline={notifications.decline}
        onMarkAllRead={notifications.markAllRead}
        onDelete={notifications.deleteNotification}
        onClearHistory={notifications.clearHistory}
        onNextPage={notifications.nextPage}
        onPrevPage={notifications.prevPage}
      />
    </RequireAuth>
  );
}

export default NotificationsPage;
