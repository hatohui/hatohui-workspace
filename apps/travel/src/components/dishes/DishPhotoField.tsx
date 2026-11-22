import { useRef, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  Button,
  ImageCropDialog,
  Label,
  type CropAspectOption,
} from '@hatohui/ui';
import { Crop, ImagePlus, Loader2, X } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import type { useDishPhoto } from '../../hooks/useDishPhoto';
import { useImagePaste } from '../../hooks/useImagePaste';

interface Props {
  photo: ReturnType<typeof useDishPhoto>;
}

const DISH_ASPECT_OPTIONS: CropAspectOption[] = [
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
];

function DishPhotoField({ photo }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useImagePaste((files) => {
    if (files[0]) setCropFile(files[0]);
  }, !photo.isUploading && !cropFile);

  return (
    <div className="space-y-1.5">
      <Label>{t('dishes.photo')}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) setCropFile(file);
        }}
      />
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
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={photo.isUploading}
        >
          <ImagePlus className="size-4" aria-hidden />
          {t('form.addPhotos')}
        </Button>
      )}
      <ImageCropDialog
        open={Boolean(cropFile)}
        file={cropFile}
        aspect={4 / 3}
        aspectOptions={DISH_ASPECT_OPTIONS}
        title={t('form.cropPhoto')}
        hint={t('form.cropHint')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('form.cropApply')}
        zoomLabel={t('form.cropZoom')}
        resetLabel={t('form.cropReset')}
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
