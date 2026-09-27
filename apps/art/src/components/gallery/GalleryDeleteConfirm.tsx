'use client';

import { useTranslation } from '@hatohui/i18n';
import { ConfirmDialog } from '@hatohui/ui';
import type { GallerySelection } from '@/hooks/useGallerySelection';

export function GalleryDeleteConfirm({
  selection,
}: {
  selection: GallerySelection;
}) {
  const { t } = useTranslation('art');

  return (
    <ConfirmDialog
      open={selection.isConfirmOpen}
      title={t('gallery.selection.confirmTitle', { count: selection.count })}
      description={t('gallery.selection.confirmDescription')}
      cancelLabel={t('gallery.selection.cancel')}
      confirmLabel={t('gallery.selection.delete')}
      onCancel={selection.cancelDelete}
      onConfirm={selection.confirmDelete}
    />
  );
}
