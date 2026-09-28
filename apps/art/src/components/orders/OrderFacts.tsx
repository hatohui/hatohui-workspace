'use client';

import type { CommissionPublicDetailDto } from '@hatohui/models';
import { useOrderFacts } from '@/hooks/useOrderFacts';

export function OrderFacts({
  commission,
}: {
  commission: CommissionPublicDetailDto;
}) {
  const facts = useOrderFacts(commission);

  if (facts.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="space-y-0.5">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {fact.label}
          </dt>
          <dd className="font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
