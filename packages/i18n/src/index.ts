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
