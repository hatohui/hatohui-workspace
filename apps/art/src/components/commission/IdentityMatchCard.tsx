'use client';

import { UserCircle } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { CommissionIdentityDto } from '@hatohui/models';

export function IdentityMatchCard({
  identity,
  onConfirm,
  onDecline,
}: {
  identity: CommissionIdentityDto;
  onConfirm: (identity: CommissionIdentityDto) => void;
  onDecline: (identity: CommissionIdentityDto) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-3 rounded-md border px-4 py-3">
      <p className="text-sm font-medium">
        {t('commission.form.identityMatchTitle')}
      </p>
      <div className="flex items-center gap-3">
        {identity.avatarUrl ? (
          <img
            src={identity.avatarUrl}
            alt=""
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="size-9 text-muted-foreground" />
        )}
        <div className="text-sm">
          <p>{identity.displayName}</p>
          {identity.handle && (
            <p className="text-muted-foreground">@{identity.handle}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onConfirm(identity)}>
          {t('commission.form.identityMatchConfirm')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onDecline(identity)}
        >
          {t('commission.form.identityMatchDecline')}
        </Button>
      </div>
    </div>
  );
}
