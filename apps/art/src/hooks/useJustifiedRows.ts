'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  galleryTileAspect,
  packJustifiedRows,
  type TileSize,
} from '@/lib/justifiedRows';

interface Measure {
  width: number;
  gap: number;
  targetHeight: number;
}

export function useJustifiedRows(items: TileSize[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [measure, setMeasure] = useState<Measure | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(element);
      setMeasure({
        width: element.clientWidth,
        gap: parseFloat(style.columnGap) || 0,
        targetHeight: parseFloat(style.getPropertyValue('--gallery-row')),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => {
    if (!measure || !measure.width || !measure.targetHeight) return null;
    return packJustifiedRows(
      items.map(galleryTileAspect),
      measure.width,
      measure.gap,
      measure.targetHeight,
    );
  }, [items, measure]);

  return { ref, rows };
}
