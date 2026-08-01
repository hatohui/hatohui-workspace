'use client';

import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@hatohui/ui';
import { PREFERRED_CONTACT_METHODS } from '@/constants/commission';
import { useCommissionForm } from '@/hooks/useCommissionForm';
import { CommissionTypeFields } from './CommissionTypeFields';
import { CommissionQuoteEstimate } from './CommissionQuoteEstimate';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';
import { DateField } from '@/components/shared/DateField';
import { CommissionVisibilityCheckbox } from './CommissionVisibilityCheckbox';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';

export function CommissionForm() {
  const { t } = useTranslation('art');
  const form = useCommissionForm();
  const [isClearOpen, setIsClearOpen] = useState(false);
  const formRef = useStaggerReveal<HTMLFormElement>(':scope > *', []);

  if (form.isSubmitted) {
    return <p className="text-lg">{t('commission.form.success')}</p>;
  }

  return (
    <form
      ref={formRef}
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
    >
      <div>
        <h1 className="font-serif text-3xl">{t('commission.form.title')}</h1>
        <p className="text-muted-foreground">{t('commission.form.subtitle')}</p>
      </div>

      {form.isDraftRestored && (
        <p className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
          {t('commission.form.draftRestored')}
        </p>
      )}

      <div>
        <Label htmlFor="title">{t('commission.form.titleLabel')}</Label>
        <Input
          id="title"
          required
          value={form.state.title}
          onChange={(event) => form.update('title', event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">
          {t('commission.form.descriptionLabel')}
        </Label>
        <Textarea
          id="description"
          required
          value={form.state.description}
          onChange={(event) => form.update('description', event.target.value)}
        />
      </div>

      <CommissionTypeFields form={form} />
      <CommissionQuoteEstimate pricing={form.pricing} />

      <div>
        <Label>{t('commission.form.deadlineLabel')}</Label>
        <DateField
          value={form.state.deadline}
          onChange={(value) => form.update('deadline', value)}
        />
      </div>

      <div>
        <Label htmlFor="clientName">
          {t('commission.form.clientNameLabel')}
        </Label>
        <Input
          id="clientName"
          required
          value={form.state.clientName}
          onChange={(event) => form.update('clientName', event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="clientEmail">
          {t('commission.form.clientEmailLabel')}
        </Label>
        <Input
          id="clientEmail"
          type="email"
          required
          value={form.state.clientEmail}
          onChange={(event) => form.update('clientEmail', event.target.value)}
        />
      </div>

      <div>
        <Label>{t('commission.form.preferredContactLabel')}</Label>
        <Select
          value={form.state.preferredContactMethod}
          onValueChange={(value) =>
            form.update(
              'preferredContactMethod',
              value as typeof form.state.preferredContactMethod,
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PREFERRED_CONTACT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {t(`commission.preferredContactMethod.${method}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {form.state.preferredContactMethod !== 'EMAIL' && (
        <div>
          <Label htmlFor="contactHandle">
            {t('commission.form.contactHandleLabel')}
          </Label>
          <Input
            id="contactHandle"
            value={form.state.contactHandle}
            onChange={(event) =>
              form.update('contactHandle', event.target.value)
            }
          />
        </div>
      )}

      <MultiImageUploadField
        label={t('commission.form.attachmentsLabel')}
        files={form.files}
        onChange={form.setFiles}
      />

      <CommissionVisibilityCheckbox
        isPublic={form.state.isPublic}
        onChange={(value) => form.update('isPublic', value)}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={form.isSubmitting} className="flex-1">
          {form.isSubmitting
            ? t('commission.form.submitting')
            : t('commission.form.submit')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsClearOpen(true)}
        >
          {t('commission.form.clear')}
        </Button>
      </div>

      <ConfirmDialog
        open={isClearOpen}
        onOpenChange={setIsClearOpen}
        title={t('commission.form.clearTitle')}
        description={t('commission.form.clearDescription')}
        confirmLabel={t('commission.form.clear')}
        cancelLabel={t('gallery.upload.cancel')}
        onConfirm={form.reset}
      />
    </form>
  );
}
