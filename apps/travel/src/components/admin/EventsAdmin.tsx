import { Link } from 'react-router';
import { useTranslation } from '@hatohui/i18n';
import { Button, ConfirmDialog } from '@hatohui/ui';
import { Check, Pencil, Trash2 } from 'lucide-react';
import routes from '../../constants/routes';
import {
  useAdminEvents,
  type AdminEventFilter,
} from '../../hooks/useAdminEvents';
import ListTableSkeleton from './ListTableSkeleton';

const FILTERS: AdminEventFilter[] = ['pending', 'approved', 'all'];

function EventsAdmin() {
  const { t } = useTranslation();
  const admin = useAdminEvents();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={admin.filter === key ? 'default' : 'outline'}
            onClick={() => admin.setFilter(key)}
          >
            {t(`admin.events.${key}`)}
          </Button>
        ))}
      </div>

      {admin.isLoading ? (
        <ListTableSkeleton />
      ) : admin.events.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('admin.events.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-border">
              {admin.events.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.startAt.slice(0, 10)} – {event.endAt.slice(0, 10)}
                      {event.location ? ` · ${event.location}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={[
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        event.isApproved
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                      ].join(' ')}
                    >
                      {event.isApproved
                        ? t('admin.events.approvedBadge')
                        : t('admin.events.pendingBadge')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {!event.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={admin.isMutating}
                          onClick={() => void admin.approve(event.id)}
                        >
                          <Check className="size-3.5" aria-hidden />
                          {t('admin.events.approve')}
                        </Button>
                      )}
                      <Button asChild size="icon" variant="ghost">
                        <Link
                          to={routes.eventEdit(event.id)}
                          aria-label={t('events.detail.edit')}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={admin.isMutating}
                        aria-label={t('recommendation.delete')}
                        onClick={() => admin.setDeleting(event)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(admin.deleting)}
        title={t('admin.events.deleteTitle', {
          title: admin.deleting?.title ?? '',
        })}
        description={t('admin.events.deleteDescription')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('recommendation.delete')}
        onCancel={() => admin.setDeleting(null)}
        onConfirm={() => void admin.confirmDelete()}
      />
    </div>
  );
}

export default EventsAdmin;
