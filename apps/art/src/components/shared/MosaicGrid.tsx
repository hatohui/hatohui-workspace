'use client';

import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import { useMosaicLayout } from '@/hooks/useMosaicLayout';
import type { TileSize } from '@/lib/justifiedRows';

export function MosaicGrid<T extends TileSize>({
  items,
  getKey,
  renderItem,
  className,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className?: string;
}) {
  const { ref, isReady, height, placements } = useMosaicLayout(items, getKey);

  return (
    <div
      ref={ref}
      style={{ height }}
      className={cn('relative', !isReady && 'invisible', className)}
    >
      {placements.map(({ item, left, top, width, height: tileHeight }) => (
        <div
          key={getKey(item)}
          style={{ left, top, width, height: tileHeight }}
          className="absolute"
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
