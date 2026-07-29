import { persistLocale, useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES } from '../../config/i18n';

function LanguageOptionsList() {
  const { i18n } = useTranslation();

  const handleSelect = (locale: string) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return (
    <ul className="flex flex-col gap-0.5">
      {SUPPORTED_LOCALES.map((locale) => (
        <li key={locale}>
          <button
            type="button"
            onClick={() => handleSelect(locale)}
            className={cn(
              'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
              i18n.language === locale && 'font-medium text-primary',
            )}
          >
            {LANGUAGE_NAMES[locale]}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default LanguageOptionsList;
