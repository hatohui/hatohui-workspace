'use client';

import { Tag } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  TagInput,
  type TagSuggestion,
} from '@hatohui/ui';

export function UploadItemTagsPopover({
  fileName,
  tags,
  onTagsChange,
  suggestions,
  disabled,
}: {
  fileName: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions: TagSuggestion[];
  disabled: boolean;
}) {
  const { t } = useTranslation('art');

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        aria-label={t('gallery.upload.itemTags', { name: fileName })}
        className="absolute bottom-1 left-1 flex h-7 items-center gap-1 rounded-full bg-background/90 px-2 text-xs text-foreground shadow-sm transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <Tag className="size-3.5" aria-hidden />
        {tags.length > 0 && <span className="tabular-nums">{tags.length}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <TagInput
          value={tags}
          onChange={onTagsChange}
          suggestions={suggestions}
          placeholder={t('gallery.upload.tagsPlaceholder')}
          createLabel={(tag) => t('gallery.upload.tagCreate', { tag })}
          removeLabel={(tag) => t('gallery.upload.tagRemove', { tag })}
        />
        <p className="text-xs text-muted-foreground">
          {t('gallery.upload.itemTagsHint')}
        </p>
      </PopoverContent>
    </Popover>
  );
}
