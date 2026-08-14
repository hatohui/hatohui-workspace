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
  isDeleting: boolean;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onAccept: (connectionId: string) => void;
  onDecline: (connectionId: string) => void;
  onMarkAllRead: () => void;
  onDelete: (notificationId: string) => void;
  onClearHistory: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
};

function NotificationList({
  items,
  unreadCount,
  isLoading,
  isError,
  isActing,
  isDeleting,
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onAccept,
  onDecline,
  onMarkAllRead,
  onDelete,
  onClearHistory,
  onNextPage,
  onPrevPage,
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
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
              {t('notifications.markAllRead')}
            </Button>
          )}
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={onClearHistory}
            >
              {t('notifications.clearHistory')}
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('notifications.empty')}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isActing={isActing}
                isDeleting={isDeleting}
                onAccept={onAccept}
                onDecline={onDecline}
                onDelete={onDelete}
              />
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasPrevPage}
                onClick={onPrevPage}
              >
                {t('notifications.pagination.prev')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('notifications.pagination.indicator', {
                  page,
                  total: totalPages,
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasNextPage}
                onClick={onNextPage}
              >
                {t('notifications.pagination.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NotificationList;
