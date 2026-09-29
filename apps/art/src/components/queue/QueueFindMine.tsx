'use client';

import { KeyRound, Mail } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionAccessMatchDto } from '@hatohui/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hatohui/ui';
import { useCommissionAccessLookup } from '@/hooks/useCommissionAccessLookup';
import { QueueEmailLookupForm } from './QueueEmailLookupForm';
import { QueueAccessCodeForm } from './QueueAccessCodeForm';

export function QueueFindMine({
  artistId,
  onLocked,
}: {
  artistId: string;
  onLocked: (match: CommissionAccessMatchDto) => void;
}) {
  const { t } = useTranslation('art');
  const lookup = useCommissionAccessLookup(artistId, onLocked);

  return (
    <section className="space-y-4 rounded-xl border border-border p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-serif text-xl">{t('queue.findMine.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('queue.findMine.subtitle')}
        </p>
      </div>
      <Tabs defaultValue="email" className="gap-4">
        <TabsList>
          <TabsTrigger value="email">
            <Mail aria-hidden />
            {t('queue.findMine.emailTab')}
          </TabsTrigger>
          <TabsTrigger value="code">
            <KeyRound aria-hidden />
            {t('queue.findMine.codeTab')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <QueueEmailLookupForm lookup={lookup} />
        </TabsContent>
        <TabsContent value="code">
          <QueueAccessCodeForm lookup={lookup} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
