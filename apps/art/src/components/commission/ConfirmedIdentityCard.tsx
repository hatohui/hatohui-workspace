'use client';

import { UserCircle } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { CommissionIdentityDto } from '@hatohui/models';

export function ConfirmedIdentityCard({
  identity,
  onUndo,
}: {
  identity: CommissionIdentityDto;
  onUndo: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
      {identity.avatarUrl ? (
        <img
          src={identity.avatarUrl}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <UserCircle className="size-11 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          {t('commission.form.identityCardLabel')}
        </p>
        <p className="truncate font-medium">{identity.displayName}</p>
        {identity.handle && (
          <p className="truncate text-sm text-muted-foreground">
            @{identity.handle}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto shrink-0 p-0"
        onClick={onUndo}
      >
        {t('commission.form.identityUndo')}
      </Button>
    </div>
  );
}
