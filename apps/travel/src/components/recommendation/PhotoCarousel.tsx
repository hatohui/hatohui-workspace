import { useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import type { TravelImageDto } from '@hatohui/models';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePhotoCarousel } from '../../hooks/usePhotoCarousel';
import ImageFrame from '../shared/ImageFrame';
import ImageViewer from '../shared/ImageViewer';
import CarouselButton from './CarouselButton';

interface Props {
  images: TravelImageDto[];
  alt: string;
}

function PhotoCarousel({ images, alt }: Props) {
  const { t } = useTranslation();
  const { index, hasMany, next, previous } = usePhotoCarousel(images.length);
  const [viewerOpen, setViewerOpen] = useState(false);
  const active = images[index] ?? null;
  const activeSrc = active?.previewUrl ?? active?.url ?? null;

  return (
    <div className="group relative">
      {activeSrc ? (
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          aria-label={t('common:imageViewer.openFull')}
          className="block w-full cursor-zoom-in rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ImageFrame src={activeSrc} alt={alt} />
        </button>
      ) : (
        <ImageFrame src={null} alt={alt} />
      )}
      {hasMany && (
        <>
          <CarouselButton
            side="left"
            label={t('recommendation.previousPhoto')}
            icon={ChevronLeft}
            onClick={previous}
          />
          <CarouselButton
            side="right"
            label={t('recommendation.nextPhoto')}
            icon={ChevronRight}
            onClick={next}
          />
          <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-background/85 px-2 py-0.5 text-xs tabular-nums">
            {index + 1}/{images.length}
          </span>
        </>
      )}
      <ImageViewer
        src={viewerOpen ? activeSrc : null}
        alt={alt}
        caption={{ title: alt }}
        originalUrl={active?.url ?? null}
        onPrevious={hasMany ? previous : undefined}
        onNext={hasMany ? next : undefined}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}

export default PhotoCarousel;
