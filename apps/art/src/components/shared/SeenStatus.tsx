'use client';

import { Check, CheckCheck } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { SeenState } from '@/lib/seenState';

export function SeenStatus({ state }: { state: SeenState }) {
  const { t } = useTranslation('art');

  if (state === 'new')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        {t('comments.new')}
      </span>
    );
  if (state === 'seen')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCheck className="size-3.5 text-primary" aria-hidden />
        {t('comments.seen')}
      </span>
    );
  if (state === 'unseen')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="size-3.5" aria-hidden />
        {t('comments.notSeen')}
      </span>
    );
  return null;
}
