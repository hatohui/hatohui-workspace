'use client';

import { useTranslation } from '@hatohui/i18n';
import { Skeleton } from '@hatohui/ui';
import { useCommissionArtSettings } from '@/hooks/useCommissionArtSettings';
import { CommissionArtSettingsForm } from './CommissionArtSettingsForm';

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-56" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function CommissionArtSettingsSection() {
  const { t } = useTranslation('art');
  const { settings, isLoading, isSaving, save } = useCommissionArtSettings();

  return (
    <div className="space-y-3">
      <p className="max-w-2xl text-sm text-muted-foreground">
        {t('app.commissionSettings.settingsHint')}
      </p>
      {isLoading || !settings ? (
        <SettingsSkeleton />
      ) : (
        <CommissionArtSettingsForm
          key={
            settings.currency +
            settings.paymentMethods.map((m) => m.name).join(',')
          }
          initial={settings}
          saving={isSaving}
          onSave={(dto) => save({ data: dto })}
        />
      )}
    </div>
  );
}
