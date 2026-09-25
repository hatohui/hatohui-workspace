'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@hatohui/ui';
import type { useOpeningBar } from '@/hooks/useOpeningBar';
import { OpeningForm } from './OpeningForm';
import { OpeningHistoryTable } from './OpeningHistoryTable';
import { OpeningDetail } from './OpeningDetail';

export function OpeningOptionsSheet({
  bar,
}: {
  bar: ReturnType<typeof useOpeningBar>;
}) {
  const { t } = useTranslation('art');

  return (
    <Sheet open={bar.isOptionsOpen} onOpenChange={bar.setIsOptionsOpen}>
      <SheetContent closeLabel={t('app.requests.panel.close')}>
        <SheetHeader>
          <SheetTitle>{t('app.commissions.opening.optionsTitle')}</SheetTitle>
        </SheetHeader>
        <SheetBody>
          {bar.historyItem ? (
            <OpeningDetail
              opening={bar.historyItem}
              onBack={() => bar.selectHistory(null)}
            />
          ) : (
            <>
              <OpeningForm
                key={bar.active?.id ?? 'new'}
                initial={bar.active ?? undefined}
                onSubmit={bar.save}
              />
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  {t('commission.admin.opening.history')}
                </h3>
                <OpeningHistoryTable
                  items={bar.history}
                  onSelect={bar.selectHistory}
                />
              </section>
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
