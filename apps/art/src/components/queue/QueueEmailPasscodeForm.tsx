'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { useCommissionAccessLookup } from '@/hooks/useCommissionAccessLookup';
import { PASSCODE_MAX_LENGTH } from '@/constants/queue';
import { QueueLookupResults } from './QueueLookupResults';

export function QueueEmailPasscodeForm({
  lookup,
}: {
  lookup: ReturnType<typeof useCommissionAccessLookup>;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup.search();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="lookup-email">{t('queue.findMine.email')}</Label>
          <Input
            id="lookup-email"
            type="email"
            autoComplete="email"
            placeholder={t('orders.emailPlaceholder')}
            value={lookup.email}
            onChange={(event) => lookup.setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lookup-passcode">{t('queue.passcode.label')}</Label>
          <Input
            id="lookup-passcode"
            type="password"
            autoComplete="off"
            maxLength={PASSCODE_MAX_LENGTH}
            value={lookup.passcode}
            onChange={(event) => lookup.setPasscode(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          disabled={!lookup.canSearch || lookup.isSearching}
        >
          {t('orders.search')}
        </Button>
      </form>
      {lookup.error && (
        <p role="alert" className="text-sm text-destructive">
          {lookup.error}
        </p>
      )}
      <QueueLookupResults lookup={lookup} />
    </div>
  );
}
