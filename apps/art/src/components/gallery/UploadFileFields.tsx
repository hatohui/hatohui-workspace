'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label, TagInput } from '@hatohui/ui';
import { ImageDropzone } from '@/components/shared/ImageDropzone';
import type { useUploadQueue } from '@/hooks/useUploadQueue';
import { useUploadFileMessages } from '@/hooks/useUploadFileMessages';
import { useUploadTagSuggestions } from '@/hooks/useUploadTagSuggestions';
import { UploadQueueTile } from './UploadQueueTile';
import { UploadSkippedNotice } from './UploadSkippedNotice';

export function UploadFileFields({
  queue,
  tags,
  onTagsChange,
  failedCount,
  isUploading,
}: {
  queue: ReturnType<typeof useUploadQueue>;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  failedCount: number;
  isUploading: boolean;
}) {
  const { t } = useTranslation('art');
  const suggestions = useUploadTagSuggestions(true);
  const messages = useUploadFileMessages(
    queue.items,
    queue.skipped,
    queue.limits,
  );
  const hasItems = queue.items.length > 0;

  return (
    <>
      <div className="space-y-3">
        <ImageDropzone
          onFilesSelected={queue.add}
          disabled={isUploading}
          compact={hasItems}
          hint={
            hasItems
              ? t('gallery.upload.dropzoneMore')
              : t('gallery.upload.dropzone')
          }
        />
        {messages.capacity && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {messages.progress ?? messages.capacity}
          </p>
        )}
        <UploadSkippedNotice
          messages={messages.skipped}
          canCompress={queue.canCompress}
          isCompressing={queue.isCompressing}
          disabled={isUploading}
          onCompress={() => void queue.compressOversized()}
        />
        {hasItems && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {queue.items.map((item) => (
              <UploadQueueTile
                key={item.id}
                item={item}
                sharedTags={tags}
                suggestions={suggestions}
                isLocked={isUploading}
                onRemove={() => queue.remove(item.id)}
                onTagsChange={(itemTags) =>
                  queue.setItemTags(item.id, itemTags)
                }
                onDetailsChange={(details) =>
                  queue.setItemDetails(item.id, details)
                }
              />
            ))}
          </div>
        )}
      </div>
      {failedCount > 0 && (
        <p className="text-sm text-destructive">
          {t('gallery.upload.failed', { count: failedCount })}
        </p>
      )}

      {hasItems && (
        <div className="space-y-1.5">
          <Label htmlFor="tags">{t('gallery.upload.sharedTagsLabel')}</Label>
          <TagInput
            id="tags"
            value={tags}
            onChange={onTagsChange}
            suggestions={suggestions}
            placeholder={t('gallery.upload.tagsPlaceholder')}
            createLabel={(tag) => t('gallery.upload.tagCreate', { tag })}
            removeLabel={(tag) => t('gallery.upload.tagRemove', { tag })}
          />
          <p className="text-xs text-muted-foreground">
            {t('gallery.upload.tagsHint')}
          </p>
        </div>
      )}
    </>
  );
}
