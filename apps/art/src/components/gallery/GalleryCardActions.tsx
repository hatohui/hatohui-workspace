'use client';

import { FolderPlus, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';
import { useAssetManagement } from '@/hooks/useAssetUpload';

export function GalleryCardActions({
  assetId,
  onAddToProject,
}: {
  assetId: string;
  onAddToProject: () => void;
}) {
  const { t } = useTranslation('art');
  const { remove, isDeleting } = useAssetManagement();

  return (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label={t('projects.addToProject')}
        onClick={onAddToProject}
      >
        <FolderPlus />
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        aria-label={t('gallery.card.delete')}
        disabled={isDeleting}
        onClick={() => {
          if (window.confirm(t('gallery.card.deleteConfirm'))) {
            void remove(assetId);
          }
        }}
      >
        <X />
      </Button>
    </div>
  );
}
