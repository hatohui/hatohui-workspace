'use client';

import { Lock, LockOpen } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useAssetManagement } from '@/hooks/useAssetUpload';

export function GalleryCardPrivacyButton({
  assetId,
  isPrivate,
}: {
  assetId: string;
  isPrivate: boolean;
}) {
  const { t } = useTranslation('art');
  const { setPrivate, isUpdating } = useAssetManagement();
  const label = isPrivate
    ? t('gallery.card.makePublic')
    : t('gallery.card.makePrivate');

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      aria-label={label}
      aria-pressed={isPrivate}
      title={label}
      disabled={isUpdating}
      onClick={() => void setPrivate(assetId, !isPrivate)}
    >
      {isPrivate ? <LockOpen /> : <Lock />}
    </Button>
  );
}
