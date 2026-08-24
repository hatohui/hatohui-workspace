'use client';

import { useTranslation } from '@hatohui/i18n';
import { Input, Label } from '@hatohui/ui';
import { MultiImageUploadField } from '@/components/shared/MultiImageUploadField';

export function UploadFileFields({
  files,
  onFilesChange,
  tagsInput,
  onTagsInputChange,
  isUploading,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  isUploading: boolean;
}) {
  const { t } = useTranslation('art');

  return (
    <>
      <MultiImageUploadField
        label={t('gallery.upload.cta')}
        files={files}
        onChange={onFilesChange}
        isUploading={isUploading}
      />

      <div>
        <Label htmlFor="tags">{t('gallery.upload.tagsLabel')}</Label>
        <Input
          id="tags"
          value={tagsInput}
          onChange={(event) => onTagsInputChange(event.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t('gallery.upload.tagsHint')}
        </p>
      </div>
    </>
  );
}
