import i18next, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

export { useTranslation, Trans } from 'react-i18next';

type CreateI18nOptions = {
  resources: Resource;
  defaultLocale: string;
  defaultNS?: string;
};

export function createI18n({
  resources,
  defaultLocale,
  defaultNS,
}: CreateI18nOptions) {
  void i18next.use(initReactI18next).init({
    resources,
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    defaultNS,
    interpolation: { escapeValue: false },
  });

  return i18next;
}

const LOCALE_STORAGE_KEY = 'hatohui:locale';

/**
 * Picks the initial locale: a previously persisted choice, then the
 * browser's language, then `fallback`. Client-only (no SSR).
 */
export function detectLocale(
  supportedLocales: readonly string[],
  fallback: string,
): string {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && supportedLocales.includes(stored)) {
    return stored;
  }

  const browserLocale = window.navigator.language.slice(0, 2);
  if (supportedLocales.includes(browserLocale)) {
    return browserLocale;
  }

  return fallback;
}

export function persistLocale(locale: string): void {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
