'use client';

import Link from 'next/link';
import type { CommissionDto } from '@hatohui/models';
import { Card, CardContent } from '@hatohui/ui';
import { useCommissionDisplayLabel } from '@/hooks/useCommissionDisplayLabel';

export function KanbanCard({ commission }: { commission: CommissionDto }) {
  const displayLabel = useCommissionDisplayLabel();

  return (
    <Link href={`/admin/commissions/${commission.id}`}>
      <Card className="transition-colors hover:bg-card-hover">
        <CardContent className="space-y-1 p-3">
          <p className="text-sm font-medium">
            {displayLabel(commission.commissionTypeKey)}
          </p>
          <p className="text-xs text-muted-foreground">
            {commission.clientName}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
