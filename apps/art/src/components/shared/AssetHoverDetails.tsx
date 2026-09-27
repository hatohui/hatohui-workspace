'use client';

import type { AssetDto } from '@hatohui/models';
import { useAssetSummary } from '@/hooks/useAssetSummary';

export function AssetHoverDetails({ asset }: { asset: AssetDto }) {
  const { tags, date } = useAssetSummary(asset);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-1 flex-col gap-1.5 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-2 pt-10 pb-2 text-left text-white opacity-0 transition duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
      {asset.title && (
        <p className="line-clamp-2 text-sm leading-snug font-medium">
          {asset.title}
        </p>
      )}
      <div className="flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="truncate rounded-full bg-white/20 px-2 py-0.5 text-[11px] leading-4 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[11px] leading-4 text-white/80">
          {date}
        </span>
      </div>
    </div>
  );
}
