'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  RichTextView,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@hatohui/ui';
import { useCommissionRequestPanel } from '@/hooks/useCommissionRequestPanel';
import { CommissionStatusBadge } from './CommissionStatusBadge';
import { CommissionRequestFacts } from './CommissionRequestFacts';
import { CommissionRequestReferences } from './CommissionRequestReferences';
import { CommissionRequestPanelFooter } from './CommissionRequestPanelFooter';

export function CommissionRequestPanel({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('art');
  const panel = useCommissionRequestPanel(id);
  const request = panel.request;

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent closeLabel={t('app.requests.panel.close')}>
        <SheetHeader>
          <SheetTitle>{request?.title ?? t('app.requests.title')}</SheetTitle>
          <SheetDescription>
            {request ? `${request.clientName} · ${request.clientEmail}` : ''}
          </SheetDescription>
          {request && (
            <div className="pt-2">
              <CommissionStatusBadge status={request.status} />
            </div>
          )}
        </SheetHeader>

        {panel.request ? (
          <>
            <SheetBody>
              <CommissionRequestFacts facts={panel.request.facts} />
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  {t('app.requests.panel.idea')}
                </h3>
                <RichTextView value={panel.request.idea} className="text-sm" />
              </section>
              <CommissionRequestReferences urls={panel.request.references} />
            </SheetBody>
            <CommissionRequestPanelFooter
              status={panel.request.status}
              fullPageHref={panel.request.fullPageHref}
              onAccept={panel.accept}
              onDecline={panel.decline}
              onStatusChange={panel.setStatus}
            />
          </>
        ) : (
          <div className="space-y-4 p-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
