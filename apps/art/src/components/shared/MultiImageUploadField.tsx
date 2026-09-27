'use client';

import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { ImageDropzone } from './ImageDropzone';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import type { UploadStatus } from '@/hooks/useBulkAssetUpload';

export function MultiImageUploadField({
  label,
  files,
  onChange,
  statuses,
  isUploading,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  statuses?: Map<File, UploadStatus>;
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
        <ImagePreviewGrid
          files={files}
          onRemove={removeFile}
          statuses={statuses}
          isLocked={isUploading}
        />
      </div>
    </div>
  );
}
