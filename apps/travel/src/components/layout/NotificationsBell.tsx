import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@hatohui/ui';
import { Bell, CheckCheck } from 'lucide-react';
import { useTravelNotifications } from '../../hooks/useTravelNotifications';

function NotificationsBell() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const state = useTravelNotifications(Boolean(user));

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('notifications.title')}
        title={t('notifications.title')}
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="size-4" aria-hidden />
        {state.unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-6">
              <DialogTitle>{t('notifications.title')}</DialogTitle>
              {state.items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void state.markAllRead()}
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  {t('notifications.markAllRead')}
                </Button>
              )}
            </div>
          </DialogHeader>

          {state.items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('notifications.empty')}
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {state.items.map((item) => {
                const label = t(`notifications.types.${item.type}`, {
                  actor: item.actor?.name ?? '',
                  group: '',
                  event: '',
                });

                return (
                  <li
                    key={item.id}
                    onClick={() => {
                      if (!item.readAt) void state.markRead(item.id);
                    }}
                    className={[
                      'flex cursor-pointer items-center justify-between gap-2 px-2 py-2.5 text-sm',
                      !item.readAt ? 'bg-primary/5 font-medium' : '',
                    ].join(' ')}
                  >
                    <span>{label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {item.createdAt.slice(0, 10)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NotificationsBell;
