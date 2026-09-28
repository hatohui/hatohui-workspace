'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { useCommissionPasscodeAdmin } from '@/hooks/useCommissionPasscodeAdmin';

export function CommissionPasscodeReveal({
  admin,
}: {
  admin: ReturnType<typeof useCommissionPasscodeAdmin>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-2 rounded-md bg-muted p-3">
      <div className="flex items-center gap-2">
        <code className="flex-1 font-mono text-lg tracking-widest">
          {admin.revealed}
        </code>
        <Button size="sm" variant="outline" onClick={() => void admin.copy()}>
          {admin.isCopied ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {admin.isCopied
            ? t('commission.passcode.copied')
            : t('commission.passcode.copy')}
        </Button>
        <Button size="sm" variant="ghost" onClick={admin.dismissRevealed}>
          {t('commission.passcode.done')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('commission.passcode.shownOnce')}
      </p>
    </div>
  );
}
