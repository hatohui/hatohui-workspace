'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionDetail } from '@/hooks/useCommissionDetail';
import { CommissionStatusControl } from './CommissionStatusControl';
import { CommissionStepChecklist } from './CommissionStepChecklist';
import { CommissionQuoteEditor } from './CommissionQuoteEditor';
import { CommissionDeliverPanel } from './CommissionDeliverPanel';
import { CommissionAdminNotes } from './CommissionAdminNotes';
import { CommissionHistoryList } from './CommissionHistoryList';
import { CommissionVisibilityToggle } from './CommissionVisibilityToggle';
import { CommissionProjectSelect } from './CommissionProjectSelect';

export function CommissionDetailAdmin({ id }: { id: string }) {
  const { t } = useTranslation('art');
  const detail = useCommissionDetail(id);
  const commission = detail.commission;

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
          <h1 className="font-serif text-2xl">{commission.title}</h1>
          <p className="text-muted-foreground">
            {commission.clientName} · {commission.clientEmail}
          </p>
        </div>
        <CommissionVisibilityToggle
          isHidden={commission.isHidden}
          onChange={detail.setVisibility}
        />
      </div>

      <p>{commission.description}</p>

      <CommissionStatusControl
        status={commission.status}
        onChange={detail.setStatus}
      />
      <CommissionStepChecklist
        steps={commission.steps}
        onToggle={detail.toggleStep}
      />
      <CommissionProjectSelect
        projectId={commission.projectId}
        onChange={detail.setProject}
      />
      <CommissionQuoteEditor
        commission={commission}
        paymentStatus={commission.paymentStatus}
        onSaveQuote={detail.setQuote}
        onSavePaymentStatus={detail.setPaymentStatus}
      />
      <CommissionDeliverPanel
        deliverableAssets={commission.deliverableAssets}
        onDeliver={detail.deliver}
        isDelivering={detail.isDelivering}
      />
      <CommissionAdminNotes notes={commission.notes} onAdd={detail.addNote} />
      <CommissionHistoryList history={commission.history} />
    </div>
  );
}
