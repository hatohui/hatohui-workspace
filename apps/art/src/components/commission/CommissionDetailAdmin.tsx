'use client';

import { useTranslation } from '@hatohui/i18n';
import { RichTextView } from '@hatohui/ui';
import { useCommissionDetail } from '@/hooks/useCommissionDetail';
import { useCommissionDisplayLabel } from '@/hooks/useCommissionDisplayLabel';
import { CommissionStatusControl } from './CommissionStatusControl';
import { CommissionStepChecklist } from './CommissionStepChecklist';
import { CommissionQuoteEditor } from './CommissionQuoteEditor';
import { CommissionDeliverPanel } from './CommissionDeliverPanel';
import { CommissionProgressTimeline } from './CommissionProgressTimeline';
import { CommissionAdminNotes } from './CommissionAdminNotes';
import { CommissionHistoryList } from './CommissionHistoryList';
import { CommissionGalleryToggle } from './CommissionGalleryToggle';
import { CommissionVisibilityToggle } from './CommissionVisibilityToggle';
import { CommissionPurgeBanner } from './CommissionPurgeBanner';
import { CommissionPasscodePanel } from './CommissionPasscodePanel';

export function CommissionDetailAdmin({ id }: { id: string }) {
  const { t } = useTranslation('art');
  const detail = useCommissionDetail(id);
  const commission = detail.commission;
  const displayLabel = useCommissionDisplayLabel();

  if (detail.isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (!commission)
    return (
      <p className="text-muted-foreground">{t('common:errors.notFound')}</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">
            {displayLabel(commission.commissionTypeKey)}
          </h1>
          <p className="text-muted-foreground">
            {commission.clientName} · {commission.clientEmail}
          </p>
        </div>
        {!commission.purgedAt && (
          <div className="flex flex-wrap items-center gap-2">
            <CommissionGalleryToggle
              allowGalleryPost={commission.allowGalleryPost}
              onChange={detail.setAllowGalleryPost}
            />
            <CommissionVisibilityToggle
              isHiddenInQueue={commission.isHiddenInQueue}
              onChange={detail.setVisibility}
            />
          </div>
        )}
      </div>

      <CommissionPurgeBanner
        purgedAt={commission.purgedAt}
        purgeAt={commission.purgeAt}
      />

      {commission.purgedAt ? (
        <CommissionHistoryList history={commission.history} />
      ) : (
        <CommissionDetailBody detail={detail} />
      )}
    </div>
  );
}

function CommissionDetailBody({
  detail,
}: {
  detail: ReturnType<typeof useCommissionDetail>;
}) {
  const commission = detail.commission;
  if (!commission) return null;

  return (
    <>
      <RichTextView value={commission.idea} />

      <CommissionStatusControl
        status={commission.status}
        onChange={detail.setStatus}
      />
      <CommissionPasscodePanel
        commissionId={commission.id}
        source={commission.passcodeSource}
      />
      <CommissionStepChecklist
        steps={commission.steps}
        onToggle={detail.toggleStep}
      />
      <CommissionQuoteEditor
        commission={commission}
        paymentStatus={commission.paymentStatus}
        onSaveQuote={detail.setQuote}
        onSavePaymentStatus={detail.setPaymentStatus}
      />
      <CommissionDeliverPanel
        deliveredAt={commission.deliveredAt}
        onDeliver={detail.deliver}
        isDelivering={detail.isDelivering}
      />
      <CommissionProgressTimeline commissionId={commission.id} />
      <CommissionAdminNotes
        notes={commission.comments}
        onAdd={detail.addNote}
      />
      <CommissionHistoryList history={commission.history} />
    </>
  );
}
