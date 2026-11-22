import { useTranslation } from '@hatohui/i18n';
import { Avatar, Button, Input } from '@hatohui/ui';
import { Trash2 } from 'lucide-react';
import { useAdminJobProfiles } from '../../hooks/useAdminJobProfiles';
import ListTableSkeleton from './ListTableSkeleton';

function JobProfilesAdmin() {
  const { t } = useTranslation();
  const { profiles, isLoading, isMutating, saveRow, deleteRow } =
    useAdminJobProfiles();

  if (isLoading) {
    return <ListTableSkeleton withHeader />;
  }

  if (profiles.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t('admin.jobProfiles.empty')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5 font-medium">
              {t('admin.jobProfiles.user')}
            </th>
            <th className="px-3 py-2.5 font-medium">
              {t('admin.jobProfiles.jobTitle')}
            </th>
            <th className="px-3 py-2.5 font-medium">
              {t('admin.jobProfiles.annual')}
            </th>
            <th className="px-3 py-2.5 font-medium">
              {t('admin.jobProfiles.sick')}
            </th>
            <th className="px-3 py-2.5 font-medium">
              {t('admin.jobProfiles.cycleStart')}
            </th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {profiles.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={row.user?.avatarUrl ?? undefined}
                    alt={row.user?.displayName ?? row.userId}
                    className="size-7"
                  />
                  <div>
                    <div className="font-medium">
                      {row.user?.displayName ?? row.userId}
                    </div>
                    {row.user?.handle && (
                      <div className="text-xs text-muted-foreground">
                        @{row.user.handle}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <Input
                  defaultValue={row.title ?? ''}
                  className="h-8 w-40"
                  onBlur={(e) => {
                    if (e.target.value !== (row.title ?? '')) {
                      void saveRow(row, { title: e.target.value });
                    }
                  }}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  min={0}
                  max={365}
                  defaultValue={row.daysOfLeave}
                  className="h-8 w-20"
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (!Number.isNaN(value) && value !== row.daysOfLeave) {
                      void saveRow(row, { daysOfLeave: value });
                    }
                  }}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="number"
                  min={0}
                  max={365}
                  defaultValue={row.daysOfSickLeave}
                  className="h-8 w-20"
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (!Number.isNaN(value) && value !== row.daysOfSickLeave) {
                      void saveRow(row, { daysOfSickLeave: value });
                    }
                  }}
                />
              </td>
              <td className="px-3 py-2">
                <Input
                  type="date"
                  defaultValue={row.leaveCycleStart.slice(0, 10)}
                  className="h-8 w-36"
                  onBlur={(e) => {
                    if (
                      e.target.value &&
                      e.target.value !== row.leaveCycleStart.slice(0, 10)
                    ) {
                      void saveRow(row, {
                        leaveCycleStart: `${e.target.value}T00:00:00.000Z`,
                      });
                    }
                  }}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isMutating}
                  aria-label={t('recommendation.delete')}
                  onClick={() => void deleteRow(row.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobProfilesAdmin;
