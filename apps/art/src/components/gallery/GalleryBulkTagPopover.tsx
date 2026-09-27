'use client';

import { Tags } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  TagInput,
} from '@hatohui/ui';
import { useGalleryBulkTag } from '@/hooks/useGalleryBulkTag';
import { useUploadTagSuggestions } from '@/hooks/useUploadTagSuggestions';

export function GalleryBulkTagPopover({
  selectedIds,
}: {
  selectedIds: string[];
}) {
  const { t } = useTranslation('art');
  const bulkTag = useGalleryBulkTag(selectedIds);
  const suggestions = useUploadTagSuggestions(bulkTag.isOpen);

  return (
    <Popover open={bulkTag.isOpen} onOpenChange={bulkTag.setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedIds.length === 0}
        >
          <Tags />
          {t('gallery.selection.addTags')}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 space-y-3">
        <p className="text-sm font-medium">
          {t('gallery.selection.addTagsTitle', { count: selectedIds.length })}
        </p>
        <TagInput
          value={bulkTag.tags}
          onChange={bulkTag.setTags}
          suggestions={suggestions}
          placeholder={t('gallery.upload.tagsPlaceholder')}
          createLabel={(tag) => t('gallery.upload.tagCreate', { tag })}
          removeLabel={(tag) => t('gallery.upload.tagRemove', { tag })}
        />
        <p className="text-xs text-muted-foreground">
          {t('gallery.selection.addTagsHint')}
        </p>
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={!bulkTag.canApply}
          onClick={bulkTag.apply}
        >
          {bulkTag.isApplying && <Spinner />}
          {t('gallery.selection.applyTags')}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
