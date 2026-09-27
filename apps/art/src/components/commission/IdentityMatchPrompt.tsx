'use client';

import { UserCheck } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { IdentityMatchCard } from './IdentityMatchCard';

export function IdentityMatchPrompt({
  form,
}: {
  form: ReturnType<typeof useCommissionForm>;
}) {
  const { t } = useTranslation('art');
  const matched = form.state.matchedIdentity;

  if (matched) {
    return (
      <p className="flex flex-wrap items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
        <UserCheck className="size-4 shrink-0 text-muted-foreground" />
        {t('commission.form.identityConfirmed', {
          name: matched.displayName,
        })}
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={form.clearIdentity}
        >
          {t('commission.form.identityUndo')}
        </Button>
      </p>
    );
  }

  if (!form.suggestedIdentity) return null;

  return (
    <IdentityMatchCard
      identity={form.suggestedIdentity}
      onConfirm={form.confirmIdentity}
      onDecline={form.declineIdentity}
    />
  );
}
