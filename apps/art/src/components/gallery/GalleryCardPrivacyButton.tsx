'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useAssetManagement } from '@/hooks/useAssetUpload';

export function GalleryCardPrivacyButton({
  assetId,
  isPrivate,
  isPrivateViaProject,
}: {
  assetId: string;
  isPrivate: boolean;
  isPrivateViaProject: boolean;
}) {
  const { t } = useTranslation('art');
  const { setPrivate, isUpdating } = useAssetManagement();
  const label = isPrivateViaProject
    ? t('gallery.card.privateProjectHint')
    : isPrivate
      ? t('gallery.card.makePublic')
      : t('gallery.card.makePrivate');

  return (
    <span title={label}>
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label={label}
        aria-pressed={isPrivate || isPrivateViaProject}
        disabled={isUpdating || isPrivateViaProject}
        onClick={() => void setPrivate(assetId, !isPrivate)}
      >
        {isPrivate || isPrivateViaProject ? <EyeOff /> : <Eye />}
      </Button>
    </span>
  );
}
