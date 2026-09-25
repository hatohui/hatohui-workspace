'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Avatar } from '@hatohui/ui';

interface ClientAccount {
  name: string;
  avatarUrl: string | null;
  handle: string | null;
  profileHref: string | null;
}

export function ClientAccountCard({
  account,
}: {
  account: ClientAccount | null;
}) {
  const { t } = useTranslation('art');

  if (!account) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        <UserRound className="size-4 shrink-0" aria-hidden />
        {t('app.clients.guest')}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
      <Avatar
        src={account.avatarUrl ?? undefined}
        alt={account.name}
        className="size-9"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{account.name}</p>
        <p className="text-xs text-muted-foreground">
          {account.handle
            ? `@${account.handle}`
            : t('app.clients.linkedAccount')}
        </p>
      </div>
      {account.profileHref && (
        <Link
          href={account.profileHref}
          className="text-sm underline-offset-4 hover:underline"
        >
          {t('app.clients.viewProfile')}
        </Link>
      )}
    </div>
  );
}
