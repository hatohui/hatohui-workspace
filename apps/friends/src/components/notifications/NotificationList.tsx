import { useTranslation } from '@hatohui/i18n';
import { Button, LoadingDots } from '@hatohui/ui';
import type { NotificationDto } from '@hatohui/models';
import NotificationItem from './NotificationItem';

type Props = {
  items: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  isActing: boolean;
  onAccept: (connectionId: string) => void;
  onDecline: (connectionId: string) => void;
  onMarkAllRead: () => void;
};

function NotificationList({
  items,
  unreadCount,
  isLoading,
  isError,
  isActing,
  onAccept,
  onDecline,
  onMarkAllRead,
}: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingDots label={t('common:loading')} />
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {t('common:loadError')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">{t('notifications.title')}</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('notifications.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isActing={isActing}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationList;
