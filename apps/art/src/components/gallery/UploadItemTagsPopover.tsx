'use client';

import { Tag } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TagInput,
  type TagSuggestion,
} from '@hatohui/ui';
import { useItemTagSummary } from '@/hooks/useItemTagSummary';
import { UploadInheritedTags } from './UploadInheritedTags';

export function UploadItemTagsPopover({
  fileName,
  tags,
  sharedTags,
  onTagsChange,
  suggestions,
  disabled,
}: {
  fileName: string;
  tags: string[];
  sharedTags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions: TagSuggestion[];
  disabled: boolean;
}) {
  const { t } = useTranslation('art');
  const summary = useItemTagSummary(fileName, sharedTags, tags, suggestions);

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        aria-label={summary.label}
        title={summary.label}
        className={cn(
          'absolute bottom-1 left-1 flex h-7 items-center gap-1 rounded-full px-2 text-xs shadow-sm transition-colors disabled:opacity-50',
          summary.hasOwn
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-background/90 text-foreground hover:bg-secondary',
        )}
      >
        <Tag className="size-3.5" aria-hidden />
        {summary.count > 0 && (
          <span className="tabular-nums">{summary.count}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <UploadInheritedTags tags={summary.inherited} />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {t('gallery.upload.itemTagsOwn')}
          </p>
          <TagInput
            value={tags}
            onChange={onTagsChange}
            suggestions={summary.suggestions}
            placeholder={t('gallery.upload.tagsPlaceholder')}
            createLabel={(tag) => t('gallery.upload.tagCreate', { tag })}
            removeLabel={(tag) => t('gallery.upload.tagRemove', { tag })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
