import { useRef } from 'react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Label } from '@hatohui/ui';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import { useDishPhoto } from '../../hooks/useDishPhoto';
import { useImagePaste } from '../../hooks/useImagePaste';

interface Props {
  initialKey: string | null;
  initialUrl: string | null;
  onChange: (key: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

function DishPhotoField({ initialKey, initialUrl, onChange }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const photo = useDishPhoto(initialKey, initialUrl, onChange);
  useImagePaste((files) => {
    if (files[0]) void photo.pickFile(files[0]);
  }, !photo.isUploading);

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
          if (file) void photo.pickFile(file);
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
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={t('dishes.removePhoto')}
            onClick={photo.remove}
            className="absolute top-1.5 right-1.5"
          >
            <X className="size-3.5" />
          </Button>
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
    </div>
  );
}

export default DishPhotoField;
