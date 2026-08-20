import { createI18n, detectLocale } from '@hatohui/i18n';
import common_en from '@hatohui/i18n/translations/en/common.json';
import workspace_en from '@hatohui/i18n/translations/en/workspace.json';
import common_vi from '@hatohui/i18n/translations/vi/common.json';
import workspace_vi from '@hatohui/i18n/translations/vi/workspace.json';
import common_zh from '@hatohui/i18n/translations/zh/common.json';
import workspace_zh from '@hatohui/i18n/translations/zh/workspace.json';
import common_ja from '@hatohui/i18n/translations/ja/common.json';
import workspace_ja from '@hatohui/i18n/translations/ja/workspace.json';

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
    en: { common: common_en, workspace: workspace_en },
    vi: { common: common_vi, workspace: workspace_vi },
    zh: { common: common_zh, workspace: workspace_zh },
    ja: { common: common_ja, workspace: workspace_ja },
  },
  defaultLocale: detectLocale(SUPPORTED_LOCALES, 'en'),
  defaultNS: 'workspace',
});
