'use client';

import { useTranslation } from '@hatohui/i18n';
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import {
  EMAIL_CONTACT_PLATFORM,
  NEW_CONTACT_OPTION,
} from '@/constants/commission';
import type { useCommissionContact } from '@/hooks/useCommissionContact';
import { NewContactFields } from './NewContactFields';

export function ContactPointPicker({
  contact,
}: {
  contact: ReturnType<typeof useCommissionContact>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-3">
      {contact.hasIdentity && (
        <div className="space-y-1.5">
          <Label>{t('commission.form.contactLabel')}</Label>
          <Select value={contact.selection} onValueChange={contact.select}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMAIL_CONTACT_PLATFORM}>
                {t('commission.form.contactEmail')}
              </SelectItem>
              {contact.existingContacts.map((point) => (
                <SelectItem key={point.platform} value={point.platform}>
                  {point.platform} · {point.value}
                </SelectItem>
              ))}
              <SelectItem value={NEW_CONTACT_OPTION}>
                {t('commission.form.contactAddNew')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {contact.showNewFields && (
        <NewContactFields contact={contact} withEmail={!contact.hasIdentity} />
      )}
    </div>
  );
}
