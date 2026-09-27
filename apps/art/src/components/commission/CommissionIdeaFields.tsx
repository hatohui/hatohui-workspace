'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label, RichTextField, cn } from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';
import { CommissionFieldError } from './CommissionFieldError';
import { CommissionReferenceLinks } from './CommissionReferenceLinks';

export function CommissionIdeaFields({
  form,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');
  const ideaError = validation.errorFor('idea');

  return (
    <div className="space-y-4">
      <div className="space-y-1.5" onBlur={validation.touchOnLeave('idea')}>
        <Label htmlFor="idea" required>
          {t('commission.form.ideaLabel')}
        </Label>
        <p className="text-xs text-muted-foreground">
          {t('commission.form.panels.ideaHint')}
        </p>
        <RichTextField
          id="idea"
          value={form.state.idea}
          className={cn(ideaError && 'border-destructive')}
          onChange={(value) => form.update('idea', value)}
        />
        <CommissionFieldError id="idea-error" message={ideaError} />
      </div>
      <div className="space-y-4">
        <MultiImageUploadField
          label={t('commission.form.attachmentsLabel')}
          hint={t('commission.form.hints.references')}
          files={form.files}
          onChange={form.setFiles}
        />
        <CommissionReferenceLinks
          links={form.state.referenceLinks}
          onChange={(links) => form.update('referenceLinks', links)}
        />
      </div>
    </div>
  );
}
