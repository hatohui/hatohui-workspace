'use client';

import { Trash2 } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Spinner } from '@hatohui/ui';
import type { GallerySelection } from '@/hooks/useGallerySelection';

export function GallerySelectionBar({
  selection,
}: {
  selection: GallerySelection;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="sticky bottom-4 z-20 mx-auto mt-6 flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur">
      <span className="px-2 text-sm font-medium" aria-live="polite">
        {t('gallery.selection.count', { count: selection.count })}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={selection.allSelected ? selection.clear : selection.selectAll}
      >
        {selection.allSelected
          ? t('gallery.selection.clear')
          : t('gallery.selection.selectAll')}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={selection.count === 0 || selection.isDeleting}
        onClick={selection.requestDelete}
      >
        {selection.isDeleting ? <Spinner /> : <Trash2 />}
        {t('gallery.selection.delete')}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={selection.stop}
      >
        {t('gallery.selection.done')}
      </Button>
    </div>
  );
}
