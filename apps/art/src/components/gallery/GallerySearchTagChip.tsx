'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';

export function GallerySearchTagChip({
  tag,
  onRemove,
}: {
  tag: string;
  onRemove: () => void;
}) {
  const { t } = useTranslation('art');

  return (
    <span className="inline-flex max-w-full shrink-0 items-center gap-1 rounded-full bg-primary/15 py-0.5 pr-1 pl-2 text-xs text-primary">
      <span className="truncate">{tag}</span>
      <button
        type="button"
        aria-label={t('gallery.clearTagFilter', { tag })}
        onClick={onRemove}
        className="cursor-pointer rounded-full p-0.5 hover:bg-background"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
