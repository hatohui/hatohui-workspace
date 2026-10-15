'use client';

import type { ProjectArtworkDto } from '@hatohui/models';
import { MosaicGrid } from '@/components/shared/MosaicGrid';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
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
      <MosaicGrid
        items={artworks}
        getKey={(artwork) => artwork.assetId ?? artwork.fullUrl}
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
