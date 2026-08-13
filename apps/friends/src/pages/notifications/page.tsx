import RequireAuth from '../../components/RequireAuth';
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
        onAccept={notifications.accept}
        onDecline={notifications.decline}
        onMarkAllRead={notifications.markAllRead}
      />
    </RequireAuth>
  );
}

export default NotificationsPage;
