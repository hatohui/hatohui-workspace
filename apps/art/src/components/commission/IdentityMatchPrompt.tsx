'use client';

import type { useCommissionForm } from '@/hooks/useCommissionForm';
import { IdentityMatchCard } from './IdentityMatchCard';

export function IdentityMatchPrompt({
  form,
}: {
  form: ReturnType<typeof useCommissionForm>;
}) {
  if (form.state.matchedIdentity || !form.suggestedIdentity) return null;

  return (
    <IdentityMatchCard
      identity={form.suggestedIdentity}
      onConfirm={form.confirmIdentity}
      onDecline={form.declineIdentity}
    />
  );
}
