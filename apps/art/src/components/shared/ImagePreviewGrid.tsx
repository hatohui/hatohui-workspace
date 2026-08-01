'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';

export function ImagePreviewGrid({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation('art');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${file.lastModified}-${index}`}
          className="group relative aspect-square overflow-hidden rounded-lg bg-card"
        >
          {previewUrls[index] && (
            <img
              src={previewUrls[index]}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          )}
          <button
            type="button"
            aria-label={t('gallery.card.delete')}
            onClick={() => onRemove(index)}
            className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
