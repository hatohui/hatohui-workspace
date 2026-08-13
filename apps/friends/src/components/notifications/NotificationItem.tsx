import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button } from '@hatohui/ui';
import type { NotificationDto } from '@hatohui/models';

type Props = {
  notification: NotificationDto;
  isActing: boolean;
  onAccept: (connectionId: string) => void;
  onDecline: (connectionId: string) => void;
};

function NotificationItem({
  notification,
  isActing,
  onAccept,
  onDecline,
}: Props) {
  const { t } = useTranslation();
  const actorName = notification.actor?.name ?? t('notifications.someone');
  const canAct = notification.isActionable && notification.subjectId !== null;

  return (
    <li
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
        notification.readAt === null ? 'bg-card' : 'bg-transparent'
      }`}
    >
      <Avatar
        src={notification.actor?.avatarUrl ?? null}
        alt={actorName}
        className="size-9 shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm">
          {t(`notifications.types.${notification.type}`, { name: actorName })}
        </p>
        {canAct && notification.subjectId && (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isActing}
              onClick={() => onAccept(notification.subjectId)}
            >
              {t('notifications.accept')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isActing}
              onClick={() => onDecline(notification.subjectId)}
            >
              {t('notifications.decline')}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export default NotificationItem;
