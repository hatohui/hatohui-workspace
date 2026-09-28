'use client';

import type { ProjectArtworkDto } from '@hatohui/models';
import { JustifiedRows } from '@/components/shared/JustifiedRows';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { GALLERY_ROW_HEIGHT_CLASS } from '@/constants/gallery';
import { ProjectArtworkTile } from './ProjectArtworkTile';

export function ProjectArtworkGrid({
  artworks,
  alt,
  onView,
  onRemove,
}: {
  artworks: ProjectArtworkDto[];
  alt: string;
  onView: (artwork: ProjectArtworkDto) => void;
  onRemove?: (assetId: string) => void;
}) {
  const gridRef = useStaggerReveal<HTMLDivElement>('[data-reveal]', [
    artworks.length,
  ]);

  return (
    <div ref={gridRef}>
      <JustifiedRows
        items={artworks}
        className={`gap-2 sm:gap-3 ${GALLERY_ROW_HEIGHT_CLASS}`}
        renderItem={(artwork) => (
          <ProjectArtworkTile
            key={artwork.assetId ?? artwork.fullUrl}
            artwork={artwork}
            alt={alt}
            onView={() => onView(artwork)}
            onRemove={
              onRemove && artwork.assetId
                ? () => onRemove(artwork.assetId as string)
                : undefined
            }
          />
        )}
      />
    </div>
  );
}
