'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input } from '@hatohui/ui';
import type { useCommissionPasscodeAdmin } from '@/hooks/useCommissionPasscodeAdmin';
import { PASSCODE_MAX_LENGTH, PASSCODE_MIN_LENGTH } from '@/constants/queue';

export function CommissionPasscodeCustomForm({
  admin,
}: {
  admin: ReturnType<typeof useCommissionPasscodeAdmin>;
}) {
  const { t } = useTranslation('art');

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        admin.saveCustom();
      }}
    >
      <Input
        autoFocus
        autoComplete="off"
        aria-label={t('commission.passcode.customLabel')}
        placeholder={t('commission.passcode.customPlaceholder', {
          min: PASSCODE_MIN_LENGTH,
        })}
        minLength={PASSCODE_MIN_LENGTH}
        maxLength={PASSCODE_MAX_LENGTH}
        value={admin.custom}
        onChange={(event) => admin.setCustom(event.target.value)}
      />
      <Button type="submit" disabled={!admin.canSaveCustom || admin.isBusy}>
        {t('commission.passcode.save')}
      </Button>
    </form>
  );
}
