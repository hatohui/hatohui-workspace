import { useTranslation } from '@hatohui/i18n';
import { Button, ConfirmDialog, Input } from '@hatohui/ui';
import { Search, Trash2 } from 'lucide-react';
import { useAdminPlans } from '../../hooks/useAdminPlans';
import ListTableSkeleton from './ListTableSkeleton';

function PlansAdmin() {
  const { t } = useTranslation();
  const admin = useAdminPlans();

  return (
    <div className="space-y-4">
      {admin.stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="text-xs text-muted-foreground">
              {t('admin.plans.statsEvents')}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {admin.stats.totalEvents}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="text-xs text-muted-foreground">
              {t('admin.plans.statsPending')}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {admin.stats.pendingEvents}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="text-xs text-muted-foreground">
              {t('admin.plans.statsGroups')}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {admin.stats.totalGroups}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="text-xs text-muted-foreground">
              {t('admin.plans.statsParticipations')}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {admin.stats.totalParticipations}
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={admin.search}
          placeholder={t('admin.plans.searchPlaceholder')}
          className="pl-9"
          onChange={(e) => admin.setSearch(e.target.value)}
        />
      </div>

      {admin.isLoading ? (
        <ListTableSkeleton />
      ) : admin.groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('admin.plans.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-border">
              {admin.groups.map((group) => (
                <tr key={group.id}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {group.eventTitle ? `${group.eventTitle} · ` : ''}
                      {t('admin.plans.members', {
                        count: group.memberCount,
                      })}{' '}
                      ·{' '}
                      {t('admin.plans.activities', {
                        count: group.activityCount,
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={admin.isDeleting}
                      aria-label={t('recommendation.delete')}
                      onClick={() => admin.setDeleting(group)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(admin.deleting)}
        title={t('admin.plans.deleteTitle', {
          name: admin.deleting?.name ?? '',
        })}
        description={t('admin.plans.deleteDescription')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('recommendation.delete')}
        onCancel={() => admin.setDeleting(null)}
        onConfirm={() => void admin.confirmDelete()}
      />
    </div>
  );
}

export default PlansAdmin;
