'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, cn } from '@hatohui/ui';
import { useBackToTop } from '@/hooks/useBackToTop';

export function BackToTopButton() {
  const { t } = useTranslation('art');
  const { isVisible, scrollToTop } = useBackToTop();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={t('site.backToTop')}
      title={t('site.backToTop')}
      tabIndex={isVisible ? 0 : -1}
      onClick={scrollToTop}
      className={cn(
        'fixed right-4 bottom-6 z-30 rounded-full border-foreground/30 bg-background shadow-lg hover:bg-accent dark:border-foreground/30 dark:bg-background dark:hover:bg-accent transition-[opacity,translate] duration-200 sm:right-6',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ArrowUp />
    </Button>
  );
}
