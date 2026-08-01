'use client';

import { useTranslation, persistLocale } from '@hatohui/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hatohui/ui';
import { SUPPORTED_LOCALES, LANGUAGE_NAMES } from '@/config/i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  return (
    <Select
      value={i18n.language}
      onValueChange={(value) => {
        void i18n.changeLanguage(value);
        persistLocale(value);
      }}
    >
      <SelectTrigger
        aria-label={t('language.label')}
        className="w-auto gap-1 border-none bg-transparent shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {LANGUAGE_NAMES[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
