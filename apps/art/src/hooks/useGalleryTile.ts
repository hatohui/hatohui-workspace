import { useMemo, type CSSProperties } from 'react';
import type { AssetDto } from '@hatohui/models';
import {
  GALLERY_MAX_ROW_HEIGHT_PX,
  GALLERY_TILE_GROWTH_ALLOWANCE,
} from '@/constants/gallery';
import { galleryTileAspect } from '@/lib/justifiedRows';

export function useGalleryTile({
  width,
  height,
}: Pick<AssetDto, 'width' | 'height'>) {
  return useMemo(() => {
    const aspect = galleryTileAspect({ width, height });
    const maxTileWidth = Math.ceil(
      GALLERY_MAX_ROW_HEIGHT_PX * aspect * GALLERY_TILE_GROWTH_ALLOWANCE,
    );

    const tileStyle: CSSProperties = {
      flexGrow: aspect,
      flexBasis: `calc(var(--gallery-row) * ${aspect})`,
      maxWidth: `calc(var(--gallery-row) * ${aspect * GALLERY_TILE_GROWTH_ALLOWANCE})`,
    };
    const frameStyle: CSSProperties = { paddingBottom: `${100 / aspect}%` };
    const sizes = `(max-width: 640px) 100vw, ${maxTileWidth}px`;

    return { tileStyle, frameStyle, sizes };
  }, [width, height]);
}
