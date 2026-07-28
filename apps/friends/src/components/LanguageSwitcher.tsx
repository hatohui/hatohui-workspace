import { Languages } from 'lucide-react';
import { persistLocale, useTranslation } from '@hatohui/i18n';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from '@hatohui/ui';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES } from '../config/i18n';

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleSelect = (locale: string) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label={t('common:language.label')}
        >
          <Languages />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        <ul className="flex flex-col">
          {SUPPORTED_LOCALES.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                onClick={() => handleSelect(locale)}
                className={cn(
                  'flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                  i18n.language === locale && 'font-medium text-primary',
                )}
              >
                {LANGUAGE_NAMES[locale]}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export default LanguageSwitcher;
