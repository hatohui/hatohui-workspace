'use client';

import { useTranslation } from '@hatohui/i18n';
import { useAuth } from '@hatohui/libs';

export function AppDashboard() {
  const { t } = useTranslation('art');
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      <h1 className="font-serif text-2xl">{t('app.dashboard.title')}</h1>
      <p className="text-muted-foreground">
        {t('app.dashboard.welcome', { name: user?.name ?? '' })}
      </p>
    </div>
  );
}
