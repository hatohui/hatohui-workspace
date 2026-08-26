import { Languages } from 'lucide-react';
import { persistLocale, useTranslation } from '@hatohui/i18n';
import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@hatohui/ui';

// Kept in sync with each app's own config/i18n.ts SUPPORTED_LOCALES /
// LANGUAGE_NAMES (identical across apps today). The onboarding modal is
// modal (blocks the background), so the app shell's own language switcher
// is unreachable while it's open — this gives users a way out if their
// language was auto-detected wrong.
const LOCALES = ['en', 'vi', 'zh', 'ja'] as const;
const LANGUAGE_NAMES: Record<(typeof LOCALES)[number], string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  zh: '中文',
  ja: '日本語',
};

function OnboardingLanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleSelect = (locale: string) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('common:language.label')}
        >
          <Languages className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1.5">
        <ul className="flex flex-col gap-0.5">
          {LOCALES.map((locale) => (
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
      </PopoverContent>
    </Popover>
  );
}

export default OnboardingLanguageSwitcher;
