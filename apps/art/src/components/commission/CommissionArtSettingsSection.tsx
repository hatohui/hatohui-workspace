'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionArtSettings } from '@/hooks/useCommissionArtSettings';
import { CommissionArtSettingsForm } from './CommissionArtSettingsForm';

export function CommissionArtSettingsSection() {
  const { t } = useTranslation('art');
  const { settings, paymentMethods, isLoading, isSaving, save } =
    useCommissionArtSettings();

  return (
    <section className="space-y-3">
      <div className="max-w-2xl space-y-1">
        <h2 className="font-medium">{t('app.commissionSettings.settings')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.settingsHint')}
        </p>
      </div>
      {!isLoading && settings && (
        <CommissionArtSettingsForm
          key={settings.currency + settings.paymentMethodKeys.join(',')}
          initial={settings}
          paymentMethods={paymentMethods}
          saving={isSaving}
          onSave={(dto) => save({ data: dto })}
        />
      )}
    </section>
  );
}
