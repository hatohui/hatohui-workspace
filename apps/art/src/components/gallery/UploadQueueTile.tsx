'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { TagSuggestion } from '@hatohui/ui';
import type { UploadItem } from '@/hooks/useUploadQueue';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { UploadTileStatus } from './UploadTileStatus';
import { UploadItemTagsPopover } from './UploadItemTagsPopover';

export function UploadQueueTile({
  item,
  suggestions,
  isLocked,
  onRemove,
  onTagsChange,
}: {
  item: UploadItem;
  suggestions: TagSuggestion[];
  isLocked: boolean;
  onRemove: () => void;
  onTagsChange: (tags: string[]) => void;
}) {
  const { t } = useTranslation('art');
  const previewUrl = useObjectUrl(item.file);

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={item.file.name}
          className="h-full w-full object-cover"
        />
      )}
      <UploadTileStatus item={item} />
      <UploadItemTagsPopover
        fileName={item.file.name}
        tags={item.tags}
        onTagsChange={onTagsChange}
        suggestions={suggestions}
        disabled={isLocked}
      />
      {!isLocked && (
        <button
          type="button"
          aria-label={t('gallery.upload.remove', { name: item.file.name })}
          onClick={onRemove}
          className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
