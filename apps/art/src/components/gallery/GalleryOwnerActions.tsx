'use client';

import { CheckSquare } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button } from '@hatohui/ui';

export function GalleryOwnerActions({
  canSelect,
  isSelecting,
  onSelect,
  onUpload,
}: {
  canSelect: boolean;
  isSelecting: boolean;
  onSelect: () => void;
  onUpload: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="flex gap-2">
      {canSelect && !isSelecting && (
        <Button type="button" variant="outline" onClick={onSelect}>
          <CheckSquare />
          {t('gallery.selection.start')}
        </Button>
      )}
      <Button type="button" onClick={onUpload}>
        {t('gallery.upload.cta')}
      </Button>
    </div>
  );
}
