'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function CommissionVisibilityToggle({
  isHidden,
  onChange,
}: {
  isHidden: boolean;
  onChange: (isHidden: boolean) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void onChange(!isHidden)}
    >
      {isHidden
        ? t('commission.admin.visibility.show')
        : t('commission.admin.visibility.hide')}
    </Button>
  );
}
