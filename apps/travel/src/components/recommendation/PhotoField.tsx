import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { ImageCropDialog, Label, type CropAspectOption } from '@hatohui/ui';
import { MAX_PHOTOS } from '../../constants/travel';
import { useImagePaste } from '../../hooks/useImagePaste';
import type { usePhotoList } from '../../hooks/usePhotoList';
import PhotoDropZone from './PhotoDropZone';
import PhotoThumb from './PhotoThumb';

interface Props {
  photos: ReturnType<typeof usePhotoList>;
}

const ASPECT_OPTIONS: CropAspectOption[] = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

function PhotoField({ photos }: Props) {
  const { t } = useTranslation();
  const [croppingId, setCroppingId] = useState<string | null>(null);
  const hasPhotos = photos.photos.length > 0;
  const addFiles = (files: File[]) => void photos.addFiles(files);
  useImagePaste(addFiles, !photos.isFull && !croppingId);

  const croppingPhoto = croppingId
    ? (photos.photos.find((item) => item.id === croppingId) ?? null)
    : null;

  return (
    <div className="space-y-2">
      <Label>{t('form.photos')}</Label>
      {!hasPhotos && <PhotoDropZone compact={false} onFiles={addFiles} />}
      {hasPhotos && (
        <div className="grid grid-cols-3 gap-2">
          {photos.photos.map((photo, index) => (
            <PhotoThumb
              key={photo.id}
              photo={photo}
              isCover={index === 0}
              onRemove={() => photos.remove(photo.id)}
              onMakeCover={() => photos.makeCover(photo.id)}
              onCrop={photo.file ? () => setCroppingId(photo.id) : undefined}
            />
          ))}
          {!photos.isFull && <PhotoDropZone compact onFiles={addFiles} />}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {t('form.photosHint', { count: MAX_PHOTOS })}
      </p>
      <ImageCropDialog
        open={Boolean(croppingPhoto?.file)}
        file={croppingPhoto?.file ?? null}
        aspect={1}
        aspectOptions={ASPECT_OPTIONS}
        title={t('form.cropPhoto')}
        hint={t('form.cropHint')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('form.cropApply')}
        zoomLabel={t('form.cropZoom')}
        resetLabel={t('form.cropReset')}
        onCancel={() => setCroppingId(null)}
        onConfirm={(cropped) => {
          if (croppingId) photos.replaceFile(croppingId, cropped);
          setCroppingId(null);
        }}
      />
    </div>
  );
}

export default PhotoField;
