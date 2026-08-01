'use client';

import Image from 'next/image';
import { useTranslation } from '@hatohui/i18n';
import { useCommissionReferenceExamples } from '@/hooks/useCommissionReferenceExamples';

export function CommissionReferenceExamples({
  tag,
}: {
  tag: string | undefined;
}) {
  const { t } = useTranslation('art');
  const { items } = useCommissionReferenceExamples(tag);

  if (!tag || items.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">
        {t('commission.form.examplesLabel')}
      </p>
      <div className="flex gap-2 overflow-x-auto">
        {items.map((asset) => (
          <div
            key={asset.id}
            className="relative size-16 shrink-0 overflow-hidden rounded-md"
          >
            <Image
              src={asset.publicUrl}
              alt={asset.filename}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
