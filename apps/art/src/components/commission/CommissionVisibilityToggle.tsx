'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function CommissionVisibilityToggle({
  isHiddenInQueue,
  onChange,
}: {
  isHiddenInQueue: boolean;
  onChange: (isHiddenInQueue: boolean) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void onChange(!isHiddenInQueue)}
    >
      {isHiddenInQueue
        ? t('commission.admin.visibility.show')
        : t('commission.admin.visibility.hide')}
    </Button>
  );
}
