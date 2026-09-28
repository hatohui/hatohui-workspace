'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function GalleryHidePrivateToggle({
  hidePrivate,
  onChange,
}: {
  hidePrivate: boolean;
  onChange: (hidePrivate: boolean) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <Button
      type="button"
      variant={hidePrivate ? 'secondary' : 'outline'}
      aria-pressed={hidePrivate}
      onClick={() => onChange(!hidePrivate)}
    >
      {hidePrivate ? <EyeOff /> : <Eye />}
      {t('gallery.hidePrivate')}
    </Button>
  );
}
