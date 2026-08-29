'use client';

import { useTranslation } from '@hatohui/i18n';
import { Skeleton } from '@hatohui/ui';
import { useCommissionTypesAdmin } from '@/hooks/useCommissionTypesAdmin';
import { CommissionTypeCard } from './CommissionTypeCard';

export function CommissionTypesEditor() {
  const { t } = useTranslation('art');
  const { items, isLoading, setEnabled, move } = useCommissionTypesAdmin();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const ordered = [...items].sort((a, b) => a.no - b.no);

  return (
    <div className="space-y-3">
      {ordered.map((type, index) => (
        <CommissionTypeCard
          key={type.commissionTypeId}
          type={type}
          isFirst={index === 0}
          isLast={index === ordered.length - 1}
          onToggle={(enabled) =>
            void setEnabled({
              id: type.commissionTypeId,
              data: { active: enabled, no: type.no },
            })
          }
          onMove={(direction) => void move(type.commissionTypeId, direction)}
        />
      ))}
      {ordered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('app.commissionSettings.noTypes')}
        </p>
      )}
    </div>
  );
}
