'use client';

import { useTranslation } from '@hatohui/i18n';
import { useCommissionCodeLookup } from '@/hooks/useCommissionLookup';
import { OrderReferenceUploader } from './OrderReferenceUploader';
import { OrderNotesThread } from './OrderNotesThread';

export function OrderDetail({ code }: { code: string }) {
  const { t } = useTranslation('art');
  const lookup = useCommissionCodeLookup(code);
  const commission = lookup.commission;

  if (lookup.isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (!commission)
    return (
      <p className="text-muted-foreground">{t('common:errors.notFound')}</p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">{commission.title}</h1>
        <p className="text-muted-foreground">{commission.description}</p>
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
        {commission.quoteCents !== null && (
          <div>
            <dt className="font-medium">
              {t('commission.form.estimateLabel')}
            </dt>
            <dd>${(commission.quoteCents / 100).toFixed(2)}</dd>
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

      {commission.deliverableAssets.length > 0 && (
        <div>
          <h2 className="font-medium">{t('orders.deliverables')}</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {commission.deliverableAssets.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full rounded object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <OrderReferenceUploader
        references={commission.referenceAssets}
        onAdd={lookup.addReferenceAssets}
        isUploading={lookup.isUploadingReferences}
      />

      <OrderNotesThread notes={commission.notes} onAdd={lookup.addNote} />
    </div>
  );
}
