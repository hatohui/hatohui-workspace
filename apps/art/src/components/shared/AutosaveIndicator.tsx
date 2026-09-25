'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Spinner, cn } from '@hatohui/ui';
import { useAutosaveStatus } from '@/hooks/useAutosaveStatus';

export function AutosaveIndicator({ className }: { className?: string }) {
  const { t } = useTranslation('art');
  const status = useAutosaveStatus();

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'flex h-5 items-center gap-1.5 text-sm text-muted-foreground',
        className,
      )}
    >
      {status === 'saving' && (
        <>
          <Spinner className="size-4" />
          {t('app.commissionSettings.autosaving')}
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="size-4 text-primary" aria-hidden />
          {t('app.commissionSettings.autosaved')}
        </>
      )}
    </span>
  );
}
