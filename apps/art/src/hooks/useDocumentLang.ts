'use client';

import { useEffect } from 'react';
import { useTranslation } from '@hatohui/i18n';

export function useDocumentLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const apply = (locale: string) => {
      document.documentElement.lang = locale;
    };
    apply(i18n.language);
    i18n.on('languageChanged', apply);
    return () => i18n.off('languageChanged', apply);
  }, [i18n]);
}
