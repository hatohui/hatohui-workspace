'use client';

import { Palette } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionFormPanel } from './CommissionFormPanel';
import { CommissionTypeFields } from './CommissionTypeFields';
import { CommissionExampleGallery } from './CommissionExampleGallery';

export function CommissionDetailsPanel({
  form,
  artistId,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  artistId: string;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');

  return (
    <CommissionFormPanel
      icon={Palette}
      title={t('commission.form.panels.details')}
      description={t('commission.form.panels.detailsHint')}
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <CommissionTypeFields
          form={form}
          artistId={artistId}
          validation={validation}
        />
        <CommissionExampleGallery form={form} artistId={artistId} />
      </div>
    </CommissionFormPanel>
  );
}
