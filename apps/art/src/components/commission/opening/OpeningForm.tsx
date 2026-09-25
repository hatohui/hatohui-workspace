'use client';

import { useTranslation } from '@hatohui/i18n';
import { CheckCircle2 } from 'lucide-react';
import { Button, DateTimeField, Input, Label, Spinner } from '@hatohui/ui';
import type {
  CommissionOpeningDto,
  UpsertCommissionOpeningDto,
} from '@hatohui/models';
import { useOpeningForm } from '@/hooks/useOpeningForm';
import { OpeningEndModePicker } from './OpeningEndModePicker';
import { OpeningFieldHint } from './OpeningFieldHint';

export function OpeningForm({
  initial,
  onSubmit,
}: {
  initial?: CommissionOpeningDto;
  onSubmit: (dto: UpsertCommissionOpeningDto) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');
  const form = useOpeningForm(initial, onSubmit);

  return (
    <div className="space-y-5">
      <OpeningEndModePicker value={form.endMode} onChange={form.setEndMode} />

      {form.endMode === 'SLOT_CAP' && (
        <div className="space-y-1.5">
          <Label htmlFor="slot-cap" required>
            {t('commission.admin.opening.slotCap')}
          </Label>
          <Input
            id="slot-cap"
            type="number"
            inputMode="numeric"
            min={1}
            required
            className="max-w-40"
            value={form.slotCap}
            aria-invalid={form.slotCapError ? true : undefined}
            onBlur={form.revealErrors}
            onChange={(event) => form.setSlotCap(event.target.value)}
          />
          <OpeningFieldHint
            error={form.slotCapError}
            hint={t('commission.admin.opening.slotCapHint')}
          />
        </div>
      )}

      {form.isNew && (
        <div className="space-y-1.5">
          <Label htmlFor="scheduled-at">
            {t('commission.admin.opening.scheduledAt')}
          </Label>
          <DateTimeField
            id="scheduled-at"
            value={form.scheduledAt}
            invalid={Boolean(form.scheduledError)}
            clearLabel={t('commission.admin.opening.clear')}
            onChange={form.setScheduledAt}
          />
          <OpeningFieldHint
            error={form.scheduledError}
            hint={
              form.timezone
                ? t('commission.admin.opening.scheduledAtTimezoneHint', {
                    timezone: form.timezone,
                  })
                : t('commission.admin.opening.scheduledAtHint')
            }
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="post-title">
          {t('commission.admin.opening.postTitle')}
        </Label>
        <Input
          id="post-title"
          value={form.postTitle}
          placeholder={t('commission.admin.opening.postTitlePlaceholder')}
          onChange={(event) => form.setPostTitle(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {t('commission.admin.opening.postTitleHint')}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button disabled={form.isBusy} onClick={form.submit}>
          {form.isBusy && <Spinner className="size-4" />}
          {form.submitLabel}
        </Button>
        {form.isSaved && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" aria-hidden />
            {t('commission.admin.opening.saved')}
          </span>
        )}
      </div>
    </div>
  );
}
