import { createI18n, detectLocale } from '@hatohui/i18n';
import common_en from '@hatohui/i18n/translations/en/common.json';
import friends_en from '@hatohui/i18n/translations/en/friends.json';
import common_vi from '@hatohui/i18n/translations/vi/common.json';
import friends_vi from '@hatohui/i18n/translations/vi/friends.json';
import common_zh from '@hatohui/i18n/translations/zh/common.json';
import friends_zh from '@hatohui/i18n/translations/zh/friends.json';
import common_ja from '@hatohui/i18n/translations/ja/common.json';
import friends_ja from '@hatohui/i18n/translations/ja/friends.json';

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
    en: { common: common_en, friends: friends_en },
    vi: { common: common_vi, friends: friends_vi },
    zh: { common: common_zh, friends: friends_zh },
    ja: { common: common_ja, friends: friends_ja },
  },
  defaultLocale: detectLocale(SUPPORTED_LOCALES, 'en'),
  defaultNS: 'friends',
});
