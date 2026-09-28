'use client';

import { KeyRound } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { PasscodeSource } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { useCommissionPasscodeAdmin } from '@/hooks/useCommissionPasscodeAdmin';
import { CommissionPasscodeReveal } from './CommissionPasscodeReveal';
import { CommissionPasscodeCustomForm } from './CommissionPasscodeCustomForm';

export function CommissionPasscodePanel({
  commissionId,
  source,
}: {
  commissionId: string;
  source: PasscodeSource | null;
}) {
  const { t } = useTranslation('art');
  const admin = useCommissionPasscodeAdmin(commissionId);

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start gap-3">
        <KeyRound className="mt-0.5 size-5 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="font-medium">{t('commission.passcode.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t(`commission.passcode.source.${source ?? 'NONE'}`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={admin.generate} disabled={admin.isBusy}>
            {t('commission.passcode.generate')}
          </Button>
          <Button size="sm" variant="outline" onClick={admin.toggleCustom}>
            {t('commission.passcode.custom')}
          </Button>
          {source && (
            <Button
              size="sm"
              variant="ghost"
              onClick={admin.remove}
              disabled={admin.isBusy}
            >
              {t('commission.passcode.remove')}
            </Button>
          )}
        </div>
      </div>
      {admin.isCustomOpen && <CommissionPasscodeCustomForm admin={admin} />}
      {admin.revealed && <CommissionPasscodeReveal admin={admin} />}
    </section>
  );
}
