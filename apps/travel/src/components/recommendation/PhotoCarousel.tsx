import { useTranslation } from '@hatohui/i18n';
import type { TravelImageDto } from '@hatohui/models';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePhotoCarousel } from '../../hooks/usePhotoCarousel';
import ImageFrame from '../shared/ImageFrame';
import CarouselButton from './CarouselButton';

interface Props {
  images: TravelImageDto[];
  alt: string;
}

function PhotoCarousel({ images, alt }: Props) {
  const { t } = useTranslation();
  const { index, hasMany, next, previous } = usePhotoCarousel(images.length);

  return (
    <div className="group relative">
      <ImageFrame src={images[index]?.url ?? null} alt={alt} />
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
          <span className="absolute right-2 bottom-2 rounded-full bg-background/85 px-2 py-0.5 text-xs tabular-nums">
            {index + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

export default PhotoCarousel;
