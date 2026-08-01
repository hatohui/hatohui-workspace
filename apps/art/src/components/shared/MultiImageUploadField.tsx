'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { ImageDropzone } from './ImageDropzone';
import { ImagePreviewGrid } from './ImagePreviewGrid';

export function MultiImageUploadField({
  label,
  files,
  onChange,
  isUploading,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  isUploading?: boolean;
}) {
  const { t } = useTranslation('art');

  const addFiles = (added: File[]) => onChange([...files, ...added]);
  const removeFile = (index: number) =>
    onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 space-y-3">
        <ImageDropzone
          onFilesSelected={addFiles}
          disabled={isUploading}
          hint={t('gallery.upload.dropzone')}
        />
        <ImagePreviewGrid files={files} onRemove={removeFile} />
      </div>
    </div>
  );
}
