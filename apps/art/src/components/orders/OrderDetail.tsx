'use client';

import { useTranslation } from '@hatohui/i18n';
import { RichTextView } from '@hatohui/ui';
import { useCommissionCodeLookup } from '@/hooks/useCommissionLookup';
import { useCommissionDisplayLabel } from '@/hooks/useCommissionDisplayLabel';
import { OrderReferenceUploader } from './OrderReferenceUploader';
import { OrderProgressTimeline } from './OrderProgressTimeline';
import { OrderNotesThread } from './OrderNotesThread';

export function OrderDetail({ code }: { code: string }) {
  const { t } = useTranslation('art');
  const lookup = useCommissionCodeLookup(code);
  const commission = lookup.commission;
  const displayLabel = useCommissionDisplayLabel();

  if (lookup.isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (!commission)
    return (
      <p className="text-muted-foreground">{t('common:errors.notFound')}</p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">
          {displayLabel(commission.commissionTypeKey)}
        </h1>
        <RichTextView
          value={commission.idea}
          className="text-muted-foreground"
        />
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border p-4 text-sm">
        <div>
          <dt className="font-medium">{t('commission.admin.detail.status')}</dt>
          <dd>{t(`commission.status.${commission.status}`)}</dd>
        </div>
        <div>
          <dt className="font-medium">
            {t('commission.admin.detail.paymentStatus')}
          </dt>
          <dd>{t(`commission.paymentStatus.${commission.paymentStatus}`)}</dd>
        </div>
        {commission.quote !== null && (
          <div>
            <dt className="font-medium">
              {t('commission.form.estimateLabel')}
            </dt>
            <dd>${(commission.quote / 100).toFixed(2)}</dd>
          </div>
        )}
        {commission.deadline && (
          <div>
            <dt className="font-medium">
              {t('commission.admin.detail.deadline')}
            </dt>
            <dd>{new Date(commission.deadline).toLocaleDateString()}</dd>
          </div>
        )}
      </dl>

      {commission.deliveredAt && (
        <p className="text-sm text-muted-foreground">
          {t('orders.deliveredAt', {
            date: new Date(commission.deliveredAt).toLocaleDateString(),
          })}
        </p>
      )}

      <OrderProgressTimeline code={code} />

      <OrderReferenceUploader
        references={commission.referenceAssets}
        onAdd={lookup.addReferenceAssets}
        isUploading={lookup.isUploadingReferences}
      />

      <OrderNotesThread notes={commission.comments} onAdd={lookup.addNote} />
    </div>
  );
}
