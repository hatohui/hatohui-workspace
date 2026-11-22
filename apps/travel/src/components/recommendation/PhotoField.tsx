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

function PhotoField({ photos }: Props) {
  const { t } = useTranslation();
  const [croppingId, setCroppingId] = useState<string | null>(null);
  const hasPhotos = photos.photos.length > 0;
  const addFiles = (files: File[]) => void photos.addFiles(files);
  useImagePaste(addFiles, !photos.isFull && !croppingId);

  const croppingIndex = croppingId
    ? photos.photos.findIndex((item) => item.id === croppingId)
    : -1;
  const croppingPhoto =
    croppingIndex >= 0 ? photos.photos[croppingIndex] : null;
  const isCroppingCover = croppingIndex === 0;

  const coverAspectOptions: CropAspectOption[] = [
    { label: t('form.cropAspectCard'), value: 1 },
    { label: t('form.cropAspectDetail'), value: 4 / 3 },
  ];

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
        aspect={isCroppingCover ? 1 : 4 / 3}
        aspectLabel={isCroppingCover ? undefined : t('form.cropAspectDetail')}
        aspectOptions={isCroppingCover ? coverAspectOptions : undefined}
        title={t('form.cropPhoto')}
        hint={t('form.cropHint')}
        cancelLabel={t('form.cancel')}
        confirmLabel={t('form.cropApply')}
        zoomLabel={t('form.cropZoom')}
        resetLabel={t('form.cropReset')}
        fitLabel={t('form.cropFit')}
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
