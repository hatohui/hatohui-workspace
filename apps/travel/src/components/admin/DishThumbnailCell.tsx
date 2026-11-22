import type { ChangeEvent } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import { usePhotoDrop } from '../../hooks/usePhotoDrop';

interface Props {
  name: string;
  thumbnailUrl: string | null;
  isUploading: boolean;
  onPickFile: (file: File) => void;
  onRemove: () => void;
}

function DishThumbnailCell({
  name,
  thumbnailUrl,
  isUploading,
  onPickFile,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const { isDragging, handlers } = usePhotoDrop((files) => {
    if (!isUploading && files[0]) onPickFile(files[0]);
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onPickFile(file);
  };

  return (
    <div className="flex items-center justify-center px-2 py-1">
      {thumbnailUrl ? (
        <div
          {...handlers}
          className={cn(
            'group/thumb relative h-9 w-12 shrink-0 overflow-hidden rounded-md border bg-muted transition-colors',
            isDragging
              ? 'border-primary ring-2 ring-primary/30'
              : 'border-border',
          )}
        >
          <img
            src={thumbnailUrl}
            alt={name}
            className="size-full object-cover"
          />
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-3.5 animate-spin" />
            </div>
          ) : (
            <>
              <label
                aria-label={t('dishes.photo')}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-focus-within/thumb:opacity-100 group-hover/thumb:opacity-100"
              >
                <Camera className="size-3.5" aria-hidden />
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  disabled={isUploading}
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <button
                type="button"
                aria-label={t('dishes.removePhoto')}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove();
                }}
                className="absolute top-0.5 right-0.5 z-10 flex size-4 cursor-pointer items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-xs transition-opacity group-focus-within/thumb:opacity-100 group-hover/thumb:opacity-100 hover:bg-destructive hover:text-white"
              >
                <X className="size-2.5" aria-hidden />
              </button>
            </>
          )}
        </div>
      ) : (
        <label
          {...handlers}
          aria-label={t('dishes.photo')}
          className={cn(
            'relative flex h-9 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:border-foreground/45 hover:text-foreground',
            isUploading && 'pointer-events-none opacity-60',
            isDragging
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input bg-background/60 dark:bg-input/20',
          )}
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="size-4" aria-hidden />
          )}
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            disabled={isUploading}
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

export default DishThumbnailCell;
