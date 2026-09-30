'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import type { useClientPreferences } from '@/hooks/useClientPreferences';
import { EMAIL_CONTACT_PLATFORM } from '@/constants/commission';

export function OrderContactCard({
  preferences,
}: {
  preferences: ReturnType<typeof useClientPreferences>;
}) {
  const { t } = useTranslation('art');

  return (
    <section className="space-y-3 rounded-xl border border-border p-5">
      <div className="flex items-start gap-3">
        <MessageCircle
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="font-medium">{t('orders.settings.contact')}</h2>
          <p className="text-sm text-muted-foreground">
            {preferences.justSaved
              ? t('orders.settings.contactSaved')
              : t('orders.settings.contactHint')}
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
        <Select
          value={preferences.platform}
          onValueChange={preferences.setPlatform}
        >
          <SelectTrigger aria-label={t('commission.form.contactLabel')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMAIL_CONTACT_PLATFORM}>
              {t('commission.form.contactEmail')}
            </SelectItem>
            {preferences.platforms.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {preferences.needsValue ? (
          <Input
            value={preferences.value}
            onChange={(event) => preferences.setValue(event.target.value)}
            placeholder={t('orders.settings.contactValuePlaceholder')}
            aria-label={t('orders.settings.contactValuePlaceholder')}
          />
        ) : (
          <span className="hidden sm:block" />
        )}
        <Button
          variant="outline"
          disabled={!preferences.canSaveContact || preferences.isSaving}
          onClick={preferences.saveContact}
        >
          {t('orders.passcode.save')}
        </Button>
      </div>
    </section>
  );
}
