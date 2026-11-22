import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
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
  const hasPhotos = photos.photos.length > 0;
  const addFiles = (files: File[]) => void photos.addFiles(files);
  useImagePaste(addFiles, !photos.isFull);

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
            />
          ))}
          {!photos.isFull && <PhotoDropZone compact onFiles={addFiles} />}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {t('form.photosHint', { count: MAX_PHOTOS })}
      </p>
    </div>
  );
}

export default PhotoField;
