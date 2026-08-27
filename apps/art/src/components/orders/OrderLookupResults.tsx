'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@hatohui/i18n';
import type { CommissionPublicDto } from '@hatohui/models';
import { Card, CardContent } from '@hatohui/ui';
import { useCommissionDisplayLabel } from '@/hooks/useCommissionDisplayLabel';

export function OrderLookupResults({
  items,
  isLoading,
}: {
  items: CommissionPublicDto[];
  isLoading: boolean;
}) {
  const { t } = useTranslation('art');
  const { artist } = useParams<{ artist: string }>();
  const displayLabel = useCommissionDisplayLabel();

  if (isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (items.length === 0)
    return <p className="text-muted-foreground">{t('orders.empty')}</p>;

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link key={item.id} href={`/${artist}/queue/${item.accessCode}`}>
          <Card className="transition-colors hover:bg-card-hover">
            <CardContent className="flex items-center justify-between py-4">
              <span>{displayLabel(item.commissionTypeKey)}</span>
              <span className="text-sm text-muted-foreground">
                {t(`commission.status.${item.status}`)}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
