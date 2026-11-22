import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, ImageCropDialog, cn } from '@hatohui/ui';
import { Crop, ImagePlus, Loader2, X } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import type { useDishPhoto } from '../../hooks/useDishPhoto';
import { useImagePaste } from '../../hooks/useImagePaste';
import { usePhotoDrop } from '../../hooks/usePhotoDrop';
import FieldLabel from '../shared/FieldLabel';

interface Props {
  photo: ReturnType<typeof useDishPhoto>;
}

function DishPhotoField({ photo }: Props) {
  const { t } = useTranslation();
  const [cropFile, setCropFile] = useState<File | null>(null);
  const { isDragging, handlers } = usePhotoDrop((files) => {
    if (!photo.isUploading && files[0]) setCropFile(files[0]);
  });

  useImagePaste((files) => {
    if (files[0]) setCropFile(files[0]);
  }, !photo.isUploading && !cropFile);

  return (
    <div className="space-y-1.5">
      <FieldLabel optional>{t('dishes.photo')}</FieldLabel>
      {photo.previewUrl ? (
        <div className="relative aspect-[4/3] w-48 overflow-hidden rounded-lg border border-border bg-muted">
          <img
            src={photo.previewUrl}
            alt=""
            className="size-full object-cover"
          />
          {photo.isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            {photo.pendingFile && !photo.isUploading && (
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label={t('form.cropPhoto')}
                onClick={() => setCropFile(photo.pendingFile)}
              >
                <Crop className="size-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label={t('dishes.removePhoto')}
              onClick={photo.remove}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          {...handlers}
          className={cn(
            'flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground transition-colors duration-150 focus-within:ring-[3px] focus-within:ring-ring/50 hover:text-foreground motion-reduce:transition-none',
            photo.isUploading && 'pointer-events-none opacity-50',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-input bg-background/60 hover:border-foreground/40 dark:bg-input/20',
          )}
        >
          <ImagePlus className="size-6" aria-hidden />
          <span className="font-medium">{t('dishes.dropPhoto')}</span>
          <span className="text-xs">{t('form.browsePhotos')}</span>
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            disabled={photo.isUploading}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) setCropFile(file);
            }}
          />
        </label>
      )}
      <p className="text-xs text-muted-foreground">{t('dishes.photoHint')}</p>
      <ImageCropDialog
        open={Boolean(cropFile)}
        file={cropFile}
        aspect={4 / 3}
        aspectLabel={t('form.cropAspectDish')}
        title={t('form.cropPhoto')}
        hint={t('form.cropHint')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('form.cropApply')}
        zoomLabel={t('form.cropZoom')}
        resetLabel={t('form.cropReset')}
        fitLabel={t('form.cropFit')}
        onCancel={() => setCropFile(null)}
        onConfirm={(cropped) => {
          photo.pickFile(cropped);
          setCropFile(null);
        }}
      />
    </div>
  );
}

export default DishPhotoField;
