'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';

export function LanguageOptions() {
  const { t } = useTranslation('common');
  const { locales, selectLocale } = useLanguagePreference();

  return (
    <div
      role="radiogroup"
      aria-label={t('language.label')}
      className="flex flex-col gap-0.5"
    >
      {locales.map(({ locale, name, selected }) => (
        <button
          key={locale}
          type="button"
          role="radio"
          aria-checked={selected}
          lang={locale}
          onClick={() => selectLocale(locale)}
          className={cn(
            'flex min-h-10 cursor-pointer items-center justify-between rounded-md px-2 text-left text-sm transition-colors duration-200 outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
            selected && 'font-medium text-foreground',
          )}
        >
          {name}
          {selected && <Check className="size-4 text-primary" aria-hidden />}
        </button>
      ))}
    </div>
  );
}
