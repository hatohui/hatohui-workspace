'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { ThemeSelect } from '@hatohui/libs';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@hatohui/ui';
import { LanguageOptions } from './LanguageOptions';

export function PreferencesMenu() {
  const { t } = useTranslation('common');
  const label = t('preferences');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          aria-label={label}
          title={label}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-64 flex-col gap-4 p-3">
        <section className="flex flex-col gap-2">
          <h2 className="px-2 font-sans text-xs font-medium text-muted-foreground">
            {t('theme.label')}
          </h2>
          <ThemeSelect />
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="px-2 font-sans text-xs font-medium text-muted-foreground">
            {t('language.title')}
          </h2>
          <LanguageOptions />
        </section>
      </PopoverContent>
    </Popover>
  );
}
