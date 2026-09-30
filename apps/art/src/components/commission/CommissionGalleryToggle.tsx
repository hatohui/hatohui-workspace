'use client';

import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function CommissionGalleryToggle({
  allowGalleryPost,
  onChange,
}: {
  allowGalleryPost: boolean;
  onChange: (allowGalleryPost: boolean) => Promise<unknown>;
}) {
  const { t } = useTranslation('art');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void onChange(!allowGalleryPost)}
    >
      {allowGalleryPost
        ? t('commission.admin.gallery.disallow')
        : t('commission.admin.gallery.allow')}
    </Button>
  );
}
