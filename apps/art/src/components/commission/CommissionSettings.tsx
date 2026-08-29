'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import {
  COMMISSION_SETTINGS_TABS,
  type CommissionSettingsTab,
} from '@/constants/commission';
import { CommissionArtSettingsSection } from './CommissionArtSettingsSection';
import { CommissionTypesEditor } from './CommissionTypesEditor';
import { CommissionAddonPricingSection } from './CommissionAddonPricingSection';
import { CommissionRushFeeSection } from './CommissionRushFeeSection';

export function CommissionSettings({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const [tab, setTab] = useState<CommissionSettingsTab>('general');

  return (
    <div className="space-y-6">
      <header className="max-w-2xl space-y-1">
        <h1 className="font-serif text-2xl">
          {t('app.commissionSettings.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.subtitle')}
        </p>
      </header>

      <div className="flex gap-1 border-b border-border pb-2">
        {COMMISSION_SETTINGS_TABS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={tab === name ? 'default' : 'ghost'}
            onClick={() => setTab(name)}
          >
            {t(`app.commissionSettings.tabs.${name}`)}
          </Button>
        ))}
      </div>

      {tab === 'general' ? (
        <CommissionArtSettingsSection />
      ) : (
        <div className="space-y-10">
          <section className="space-y-3">
            <div className="max-w-2xl space-y-1">
              <h2 className="font-medium">
                {t('app.commissionSettings.types')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('app.commissionSettings.typesHint')}
              </p>
            </div>
            <CommissionTypesEditor />
          </section>

          <CommissionAddonPricingSection />
          <CommissionRushFeeSection artistId={artistId} />
        </div>
      )}
    </div>
  );
}
