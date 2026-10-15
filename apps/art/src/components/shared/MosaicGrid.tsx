'use client';

import type { ReactNode } from 'react';
import { cn } from '@hatohui/ui';
import { useMosaicBlocks } from '@/hooks/useMosaicBlocks';
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
  const { ref, blocks, gap, isReady } = useMosaicBlocks(items);

  return (
    <div
      ref={ref}
      style={{ gap }}
      className={cn('flex flex-col', !isReady && 'invisible', className)}
    >
      {blocks.map((block) => (
        <div
          key={getKey(items[block.columns[0].indices[0]])}
          style={{ gap }}
          className="flex items-start"
        >
          {block.columns.map((column) => (
            <div
              key={getKey(items[column.indices[0]])}
              style={{ gap, flex: `${column.width * 1000} 1 0` }}
              className="flex min-w-0 flex-col"
            >
              {column.indices.map((index) => (
                <div key={getKey(items[index])}>{renderItem(items[index])}</div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
