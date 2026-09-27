'use client';

import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';

export function UploadInheritedTags({
  tags,
}: {
  tags: { value: string; accent: boolean }[];
}) {
  const { t } = useTranslation('art');

  if (tags.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {t('gallery.upload.itemTagsInherited')}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.value}
            className={cn(
              'rounded-full px-2 py-0.5 text-xs',
              tag.accent
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30 ring-inset'
                : 'bg-secondary',
            )}
          >
            {tag.value}
          </span>
        ))}
      </div>
    </div>
  );
}
