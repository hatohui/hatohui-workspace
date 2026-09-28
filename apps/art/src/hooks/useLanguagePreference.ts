'use client';

import { persistLocale, useTranslation } from '@hatohui/i18n';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES } from '@/config/i18n';

export function useLanguagePreference() {
  const { i18n } = useTranslation('common');

  const selectLocale = (locale: string) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return {
    locales: SUPPORTED_LOCALES.map((locale) => ({
      locale,
      name: LANGUAGE_NAMES[locale],
      selected: i18n.language === locale,
    })),
    selectLocale,
  };
}
