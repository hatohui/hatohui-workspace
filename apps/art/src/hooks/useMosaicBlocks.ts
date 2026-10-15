'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  GALLERY_MOSAIC_GAP_PX,
  GALLERY_MOSAIC_GAP_SM_PX,
  GALLERY_MOSAIC_MAX_HEIGHT_RATIO,
  GALLERY_MOSAIC_MIN_HEIGHT_RATIO,
  GALLERY_MOSAIC_MIN_TILE_HEIGHT_PX,
  GALLERY_MOSAIC_MIN_TILE_WIDTH_PX,
  GALLERY_MOSAIC_PATTERNS,
  GALLERY_MOSAIC_SM_BREAKPOINT,
} from '@/constants/gallery';
import { galleryTileAspect, type TileSize } from '@/lib/justifiedRows';
import { packMosaicBlocks } from '@/lib/mosaicBlocks';

interface Metrics {
  width: number;
  gap: number;
}

export function useMosaicBlocks<T extends TileSize>(items: T[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    width: 0,
    gap: GALLERY_MOSAIC_GAP_PX,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () =>
      setMetrics({
        width: element.clientWidth,
        gap:
          window.innerWidth >= GALLERY_MOSAIC_SM_BREAKPOINT
            ? GALLERY_MOSAIC_GAP_SM_PX
            : GALLERY_MOSAIC_GAP_PX,
      });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { width, gap } = metrics;
  const isReady = width > 0;

  const blocks = useMemo(() => {
    if (!isReady) return [];

    return packMosaicBlocks(
      items.map((item) => galleryTileAspect(item)),
      width,
      gap,
      GALLERY_MOSAIC_PATTERNS,
      {
        minTileWidth: GALLERY_MOSAIC_MIN_TILE_WIDTH_PX,
        minTileHeight: GALLERY_MOSAIC_MIN_TILE_HEIGHT_PX,
        minHeight: width * GALLERY_MOSAIC_MIN_HEIGHT_RATIO,
        maxHeight: width * GALLERY_MOSAIC_MAX_HEIGHT_RATIO,
      },
    );
  }, [items, width, gap, isReady]);

  return { ref, blocks, gap, isReady };
}
