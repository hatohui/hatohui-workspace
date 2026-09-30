'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionPublicDetailDto } from '@hatohui/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import type { useCommissionCodeLookup } from '@/hooks/useCommissionLookup';
import { OrderUpdatesFeed } from './OrderUpdatesFeed';
import { OrderSettings } from './OrderSettings';

export function OrderTabs({
  code,
  commission,
  lookup,
}: {
  code: string;
  commission: CommissionPublicDetailDto;
  lookup: ReturnType<typeof useCommissionCodeLookup>;
}) {
  const { t } = useTranslation('art');

  return (
    <Tabs defaultValue="updates" className="gap-5">
      <TabsList>
        <TabsTrigger value="updates">{t('orders.tabs.updates')}</TabsTrigger>
        <TabsTrigger value="settings">{t('orders.tabs.settings')}</TabsTrigger>
      </TabsList>
      <TabsContent value="updates">
        <OrderUpdatesFeed code={code} commission={commission} lookup={lookup} />
      </TabsContent>
      <TabsContent value="settings">
        <OrderSettings code={code} commission={commission} />
      </TabsContent>
    </Tabs>
  );
}
