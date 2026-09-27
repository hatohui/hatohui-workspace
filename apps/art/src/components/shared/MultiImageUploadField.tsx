'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { ImageDropzone } from './ImageDropzone';
import { ImagePreviewGrid } from './ImagePreviewGrid';

export function MultiImageUploadField({
  label,
  hint,
  files,
  onChange,
  isUploading,
}: {
  label: string;
  hint?: string;
  files: File[];
  onChange: (files: File[]) => void;
  isUploading?: boolean;
}) {
  const { t } = useTranslation('art');

  const addFiles = (added: File[]) => onChange([...files, ...added]);
  const removeFile = (index: number) =>
    onChange(files.filter((_, i) => i !== index));

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="space-y-3">
        <ImageDropzone
          onFilesSelected={addFiles}
          disabled={isUploading}
          hint={t('gallery.upload.dropzone')}
        />
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <ImagePreviewGrid
          files={files}
          onRemove={removeFile}
          isLocked={isUploading}
        />
      </div>
    </div>
  );
}
