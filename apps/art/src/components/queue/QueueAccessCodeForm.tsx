'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { useCommissionAccessLookup } from '@/hooks/useCommissionAccessLookup';

export function QueueAccessCodeForm({
  lookup,
}: {
  lookup: ReturnType<typeof useCommissionAccessLookup>;
}) {
  const { t } = useTranslation('art');

  return (
    <form
      className="space-y-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        lookup.openCode();
      }}
    >
      <Label htmlFor="lookup-code">{t('orders.codeLabel')}</Label>
      <div className="flex gap-2">
        <Input
          id="lookup-code"
          autoComplete="off"
          spellCheck={false}
          value={lookup.code}
          onChange={(event) => lookup.setCode(event.target.value)}
        />
        <Button type="submit" disabled={!lookup.code.trim()}>
          {t('orders.codeGo')}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('queue.findMine.codeHint')}
      </p>
    </form>
  );
}
