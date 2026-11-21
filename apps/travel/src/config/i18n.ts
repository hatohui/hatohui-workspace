import { createI18n, detectLocale } from '@hatohui/i18n';
import common_en from '@hatohui/i18n/translations/en/common.json';
import travel_en from '@hatohui/i18n/translations/en/travel.json';
import common_vi from '@hatohui/i18n/translations/vi/common.json';
import travel_vi from '@hatohui/i18n/translations/vi/travel.json';
import common_zh from '@hatohui/i18n/translations/zh/common.json';
import travel_zh from '@hatohui/i18n/translations/zh/travel.json';
import common_ja from '@hatohui/i18n/translations/ja/common.json';
import travel_ja from '@hatohui/i18n/translations/ja/travel.json';

export const SUPPORTED_LOCALES = ['en', 'vi', 'zh', 'ja'] as const;

export const LANGUAGE_NAMES: Record<
  (typeof SUPPORTED_LOCALES)[number],
  string
> = {
  en: 'English',
  vi: 'Tiếng Việt',
  zh: '中文',
  ja: '日本語',
};

createI18n({
  resources: {
    en: { common: common_en, travel: travel_en },
    vi: { common: common_vi, travel: travel_vi },
    zh: { common: common_zh, travel: travel_zh },
    ja: { common: common_ja, travel: travel_ja },
  },
  defaultLocale: detectLocale(SUPPORTED_LOCALES, 'en'),
  defaultNS: 'travel',
});
