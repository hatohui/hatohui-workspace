'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label, TagInput } from '@hatohui/ui';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';
import type { UploadStatus } from '@/hooks/useBulkAssetUpload';
import { useUploadTagSuggestions } from '@/hooks/useUploadTagSuggestions';

export function UploadFileFields({
  files,
  onFilesChange,
  tags,
  onTagsChange,
  statuses,
  failedCount,
  isUploading,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  statuses: Map<File, UploadStatus>;
  failedCount: number;
  isUploading: boolean;
}) {
  const { t } = useTranslation('art');
  const suggestions = useUploadTagSuggestions(true);

  return (
    <>
      <MultiImageUploadField
        label={t('gallery.upload.cta')}
        files={files}
        onChange={onFilesChange}
        statuses={statuses}
        isUploading={isUploading}
      />
      {failedCount > 0 && (
        <p className="text-sm text-destructive">
          {t('gallery.upload.failed', { count: failedCount })}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="tags">{t('gallery.upload.tagsLabel')}</Label>
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
    </>
  );
}
