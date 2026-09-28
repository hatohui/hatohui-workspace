'use client';

import { KeyRound } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { PasscodeSource } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { useClientPasscode } from '@/hooks/useClientPasscode';
import { OrderPasscodeForm } from './OrderPasscodeForm';

export function OrderPasscodeCard({
  code,
  source,
}: {
  code: string;
  source: PasscodeSource | null;
}) {
  const { t } = useTranslation('art');
  const passcode = useClientPasscode(code);

  return (
    <section className="space-y-3 rounded-xl border border-border p-5">
      <div className="flex items-start gap-3">
        <KeyRound
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="font-medium">{t('orders.passcode.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {passcode.justSaved
              ? t('orders.passcode.saved')
              : t(`orders.passcode.source.${source ?? 'NONE'}`)}
          </p>
        </div>
        {!passcode.isEditing && (
          <Button size="sm" variant="outline" onClick={passcode.startEditing}>
            {source ? t('orders.passcode.change') : t('orders.passcode.set')}
          </Button>
        )}
      </div>
      {passcode.isEditing && <OrderPasscodeForm passcode={passcode} />}
    </section>
  );
}
