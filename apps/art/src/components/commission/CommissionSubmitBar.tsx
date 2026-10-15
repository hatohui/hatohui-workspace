'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import type { CommissionValidation } from '@/hooks/useCommissionValidation';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CommissionQuoteEstimate } from './CommissionQuoteEstimate';
import { CommissionVisibilityCheckbox } from './CommissionVisibilityCheckbox';
import { CommissionGalleryCheckbox } from './CommissionGalleryCheckbox';
import { CommissionTermsCheckbox } from './CommissionTermsCheckbox';

export function CommissionSubmitBar({
  form,
  validation,
}: {
  form: ReturnType<typeof useCommissionForm>;
  validation: CommissionValidation;
}) {
  const { t } = useTranslation('art');
  const [isClearOpen, setIsClearOpen] = useState(false);

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div className="space-y-1.5">
        <CommissionVisibilityCheckbox
          isPublic={form.state.isPublic}
          onChange={(value) => form.update('isPublic', value)}
        />
        <CommissionGalleryCheckbox
          allowGalleryPost={form.pricing.allowGalleryPost}
          privateFee={form.pricing.privateFee}
          onChange={(value) => form.update('allowGalleryPost', value)}
        />
        <CommissionTermsCheckbox
          accepted={form.state.acceptedTerms}
          error={validation.errorFor('acceptTerms')}
          onChange={(value) => {
            form.update('acceptedTerms', value);
            validation.touch('acceptTerms');
          }}
        />
        {form.hasSubmitError && (
          <p className="text-sm text-destructive" role="alert">
            {t('commission.form.submitFailed')}
          </p>
        )}
      </div>
      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-1 py-3 backdrop-blur-sm max-lg:pr-14">
        <CommissionQuoteEstimate pricing={form.pricing} />
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsClearOpen(true)}
          >
            {t('commission.form.clear')}
          </Button>
          <Button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting
              ? t('commission.form.submitting')
              : t('commission.form.submit')}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={isClearOpen}
        onOpenChange={setIsClearOpen}
        title={t('commission.form.clearTitle')}
        description={t('commission.form.clearDescription')}
        confirmLabel={t('commission.form.clear')}
        cancelLabel={t('gallery.upload.cancel')}
        onConfirm={() => {
          form.reset();
          validation.reset();
        }}
      />
    </div>
  );
}
