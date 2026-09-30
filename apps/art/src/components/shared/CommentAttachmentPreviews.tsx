'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import type { ComposerPreview } from '@/hooks/useCommentComposer';

export function CommentAttachmentPreviews({
  previews,
}: {
  previews: ComposerPreview[];
}) {
  const { t } = useTranslation('art');

  if (previews.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {previews.map((item) => (
        <li key={item.id} className="relative size-16">
          {item.src ? (
            <img
              src={item.src}
              alt=""
              className="size-full rounded-md border border-border object-cover"
            />
          ) : (
            <span className="block size-full rounded-md border border-border bg-muted" />
          )}
          {item.isUploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60">
              <Spinner className="size-4" />
            </span>
          )}
          <button
            type="button"
            className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
            aria-label={t('comments.removeAttachment')}
            onClick={item.onRemove}
          >
            <X className="size-3" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
