import { useTranslation } from '@hatohui/i18n';
import { cn } from '@hatohui/ui';
import { ImagePlus } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../../constants/travel';
import { usePhotoDrop } from '../../hooks/usePhotoDrop';

interface Props {
  compact: boolean;
  onFiles: (files: File[]) => void;
}

function PhotoDropZone({ compact, onFiles }: Props) {
  const { t } = useTranslation();
  const { isDragging, handlers } = usePhotoDrop(onFiles);

  return (
    <label
      {...handlers}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center text-sm text-muted-foreground transition-colors duration-150 focus-within:ring-[3px] focus-within:ring-ring/50 hover:text-foreground motion-reduce:transition-none',
        compact ? 'aspect-square' : 'min-h-40 px-4 py-8 lg:min-h-56',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-input bg-background/60 hover:border-foreground/40 dark:bg-input/20',
      )}
    >
      <ImagePlus className="size-6" aria-hidden />
      <span className="font-medium">{t('form.dropPhotos')}</span>
      {!compact && <span className="text-xs">{t('form.browsePhotos')}</span>}
      <input
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
    </label>
  );
}

export default PhotoDropZone;
