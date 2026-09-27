'use client';

import { NotebookPen } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { useCommissionContact } from '@/hooks/useCommissionContact';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { CommissionFormPanel } from './CommissionFormPanel';
import { CommissionAboutYouFields } from './CommissionAboutYouFields';
import { CommissionIdeaFields } from './CommissionIdeaFields';
import { CommissionSubmitBar } from './CommissionSubmitBar';

export function CommissionRequestPanel({
  form,
  contact,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  contact: ReturnType<typeof useCommissionContact>;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');

  return (
    <CommissionFormPanel
      icon={NotebookPen}
      title={t('commission.form.panels.request')}
      description={t('commission.form.panels.requestHint')}
    >
      <div className="space-y-6">
        <CommissionAboutYouFields
          form={form}
          contact={contact}
          validation={validation}
        />
        <CommissionIdeaFields form={form} validation={validation} />
      </div>
      <CommissionSubmitBar form={form} validation={validation} />
    </CommissionFormPanel>
  );
}
