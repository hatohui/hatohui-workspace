import { createI18n } from '@hatohui/i18n';
import common_en from '@hatohui/i18n/translations/en/common.json';
import art_en from '@hatohui/i18n/translations/en/art.json';
import common_vi from '@hatohui/i18n/translations/vi/common.json';
import art_vi from '@hatohui/i18n/translations/vi/art.json';
import common_zh from '@hatohui/i18n/translations/zh/common.json';
import art_zh from '@hatohui/i18n/translations/zh/art.json';
import common_ja from '@hatohui/i18n/translations/ja/common.json';
import art_ja from '@hatohui/i18n/translations/ja/art.json';

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
    en: { common: common_en, art: art_en },
    vi: { common: common_vi, art: art_vi },
    zh: { common: common_zh, art: art_zh },
    ja: { common: common_ja, art: art_ja },
  },
  defaultLocale: 'en',
  defaultNS: 'art',
});
