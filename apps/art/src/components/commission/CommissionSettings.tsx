'use client';

import { useTranslation } from '@hatohui/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import { COMMISSION_SETTINGS_TABS } from '@/constants/commission';
import { useTabParam } from '@/hooks/useTabParam';
import { CommissionArtSettingsSection } from './CommissionArtSettingsSection';
import { CommissionPricingTab } from './CommissionPricingTab';

export function CommissionSettings({ artistId }: { artistId: string }) {
  const { t } = useTranslation('art');
  const { tab, setTab } = useTabParam(COMMISSION_SETTINGS_TABS, 'general');

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">
        {t('app.commissionSettings.title')}
      </h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {COMMISSION_SETTINGS_TABS.map((name) => (
            <TabsTrigger key={name} value={name}>
              {t(`app.commissionSettings.tabs.${name}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general">
          <CommissionArtSettingsSection />
        </TabsContent>
        <TabsContent value="pricing">
          <CommissionPricingTab artistId={artistId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
