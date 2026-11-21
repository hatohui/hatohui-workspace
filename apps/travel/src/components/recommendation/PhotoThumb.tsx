import { useTranslation } from '@hatohui/i18n';
import { Spinner } from '@hatohui/ui';
import { Star, X } from 'lucide-react';
import type { PhotoItem } from '../../hooks/usePhotoList';

interface Props {
  photo: PhotoItem;
  isCover: boolean;
  onRemove: () => void;
  onMakeCover: () => void;
}

const actionClass =
  'flex size-7 cursor-pointer items-center justify-center rounded-full bg-background/90 shadow-soft';

function PhotoThumb({ photo, isCover, onRemove, onMakeCover }: Props) {
  const { t } = useTranslation();
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
      <img src={photo.url} alt="" className="size-full object-cover" />
      {!photo.key && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/60"
          aria-label={t('form.uploading')}
        >
          <Spinner />
        </div>
      )}
      <div className="absolute top-1 right-1 flex gap-1">
        {!isCover && photo.key && (
          <button
            type="button"
            className={actionClass}
            aria-label={t('form.movePhotoFirst')}
            onClick={onMakeCover}
          >
            <Star className="size-3.5" aria-hidden />
          </button>
        )}
        <button
          type="button"
          className={actionClass}
          aria-label={t('form.removePhoto')}
          onClick={onRemove}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default PhotoThumb;
