'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button, Input, Label } from '@hatohui/ui';
import type { useClientPasscode } from '@/hooks/useClientPasscode';
import { PASSCODE_MAX_LENGTH, PASSCODE_MIN_LENGTH } from '@/constants/queue';

export function OrderPasscodeForm({
  passcode,
}: {
  passcode: ReturnType<typeof useClientPasscode>;
}) {
  const { t } = useTranslation('art');

  return (
    <form
      className="space-y-2 pl-8"
      onSubmit={(event) => {
        event.preventDefault();
        passcode.submit();
      }}
    >
      <Label htmlFor="order-passcode">{t('orders.passcode.newLabel')}</Label>
      <div className="flex gap-2">
        <Input
          id="order-passcode"
          type="password"
          autoFocus
          autoComplete="new-password"
          minLength={PASSCODE_MIN_LENGTH}
          maxLength={PASSCODE_MAX_LENGTH}
          value={passcode.passcode}
          onChange={(event) => passcode.setPasscode(event.target.value)}
        />
        <Button type="submit" disabled={!passcode.canSave || passcode.isSaving}>
          {t('orders.passcode.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={passcode.cancel}>
          {t('gallery.upload.cancel')}
        </Button>
      </div>
      <p
        role={passcode.error ? 'alert' : undefined}
        className={
          passcode.error
            ? 'text-sm text-destructive'
            : 'text-sm text-muted-foreground'
        }
      >
        {passcode.error ??
          t('orders.passcode.hint', { min: PASSCODE_MIN_LENGTH })}
      </p>
    </form>
  );
}
