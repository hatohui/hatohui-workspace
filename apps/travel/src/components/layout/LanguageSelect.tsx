import { persistLocale, useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES } from '../../config/i18n';

function LanguageSelect() {
  const { t, i18n } = useTranslation();

  const select = (locale: string) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return (
    <div
      role="radiogroup"
      aria-label={t('common:language.title')}
      className="grid grid-cols-2 gap-1"
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const selected = i18n.language === locale;
        return (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => select(locale)}
            className={cn(
              'cursor-pointer rounded-md px-2 py-1.5 text-left text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
              selected && 'bg-accent font-medium text-foreground',
            )}
          >
            {LANGUAGE_NAMES[locale]}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSelect;
