import { useMemo, type CSSProperties } from 'react';
import { GALLERY_MOSAIC_SIZES } from '@/constants/gallery';
import { galleryTileAspect, type TileSize } from '@/lib/justifiedRows';

export function useMosaicTile({ width, height }: TileSize) {
  return useMemo(() => {
    const aspect = galleryTileAspect({ width, height });
    const frameStyle: CSSProperties = { paddingBottom: `${100 / aspect}%` };

    return { frameStyle, sizes: GALLERY_MOSAIC_SIZES };
  }, [width, height]);
}
