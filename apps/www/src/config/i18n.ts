import { createI18n, detectLocale } from '@hatohui/i18n';
import common_en from '@hatohui/i18n/translations/en/common.json';
import www_en from '@hatohui/i18n/translations/en/www.json';
import common_vi from '@hatohui/i18n/translations/vi/common.json';
import www_vi from '@hatohui/i18n/translations/vi/www.json';
import common_zh from '@hatohui/i18n/translations/zh/common.json';
import www_zh from '@hatohui/i18n/translations/zh/www.json';
import common_ja from '@hatohui/i18n/translations/ja/common.json';
import www_ja from '@hatohui/i18n/translations/ja/www.json';

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
    en: { common: common_en, www: www_en },
    vi: { common: common_vi, www: www_vi },
    zh: { common: common_zh, www: www_zh },
    ja: { common: common_ja, www: www_ja },
  },
  defaultLocale: detectLocale(SUPPORTED_LOCALES, 'en'),
  defaultNS: 'www',
});
