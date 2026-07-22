import { createI18n } from '@hatohui/i18n';
import common from '@hatohui/i18n/translations/en/common.json';
import friends from '@hatohui/i18n/translations/en/friends.json';

createI18n({
  resources: { en: { common, friends } },
  defaultLocale: 'en',
  defaultNS: 'friends',
});
