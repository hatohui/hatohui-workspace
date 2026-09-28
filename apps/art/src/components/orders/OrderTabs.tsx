'use client';

import { useTranslation } from '@hatohui/i18n';
import type { CommissionPublicDetailDto } from '@hatohui/models';
import {
  RichTextView,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@hatohui/ui';
import type { useCommissionCodeLookup } from '@/hooks/useCommissionLookup';
import { OrderProgressTimeline } from './OrderProgressTimeline';
import { OrderNotesThread } from './OrderNotesThread';
import { OrderReferenceUploader } from './OrderReferenceUploader';

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
        <TabsTrigger value="messages">{t('orders.tabs.messages')}</TabsTrigger>
        <TabsTrigger value="references">
          {t('orders.tabs.references')}
        </TabsTrigger>
        <TabsTrigger value="request">{t('orders.tabs.request')}</TabsTrigger>
      </TabsList>
      <TabsContent value="updates">
        <OrderProgressTimeline code={code} />
      </TabsContent>
      <TabsContent value="messages">
        <OrderNotesThread notes={commission.comments} onAdd={lookup.addNote} />
      </TabsContent>
      <TabsContent value="references">
        <OrderReferenceUploader
          references={commission.referenceAssets}
          onAdd={lookup.addReferenceAssets}
          isUploading={lookup.isUploadingReferences}
        />
      </TabsContent>
      <TabsContent value="request">
        <RichTextView value={commission.idea} />
      </TabsContent>
    </Tabs>
  );
}
