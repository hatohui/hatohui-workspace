'use client';

import { useTranslation } from '@hatohui/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import { COMMISSION_HUB_TABS } from '@/constants/commission';
import { useTabParam } from '@/hooks/useTabParam';
import { CommissionRequestsView } from '@/components/requests/CommissionRequestsView';
import { OpeningBar } from './opening/OpeningBar';
import { KanbanBoard } from './KanbanBoard';

export function CommissionsHub() {
  const { t } = useTranslation('art');
  const { tab, setTab } = useTabParam(COMMISSION_HUB_TABS, 'requests');

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">{t('app.commissions.title')}</h1>
      <OpeningBar />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {COMMISSION_HUB_TABS.map((name) => (
            <TabsTrigger key={name} value={name}>
              {t(`app.commissions.tabs.${name}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="requests">
          <CommissionRequestsView view="requests" />
        </TabsContent>
        <TabsContent value="queue">
          <KanbanBoard />
        </TabsContent>
        <TabsContent value="past">
          <CommissionRequestsView view="past" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
