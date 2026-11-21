import { useTranslation } from '@hatohui/i18n';
import { Label } from '@hatohui/ui';
import { ImagePlus } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import type { usePhotoList } from '../../hooks/usePhotoList';
import PhotoThumb from './PhotoThumb';

interface Props {
  photos: ReturnType<typeof usePhotoList>;
}

function PhotoField({ photos }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <Label>{t('form.photos')}</Label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.photos.map((photo, index) => (
          <PhotoThumb
            key={photo.id}
            photo={photo}
            isCover={index === 0}
            onRemove={() => photos.remove(photo.id)}
            onMakeCover={() => photos.makeCover(photo.id)}
          />
        ))}
        {!photos.isFull && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground focus-within:ring-[3px] focus-within:ring-ring/50">
            <ImagePlus className="size-5" aria-hidden />
            {t('form.addPhotos')}
            <input
              type="file"
              multiple
              accept={ACCEPTED_IMAGE_TYPES}
              className="sr-only"
              onChange={(event) => {
                void photos.addFiles(Array.from(event.target.files ?? []));
                event.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default PhotoField;
