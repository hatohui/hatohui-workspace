'use client';

import type { AssetDto } from '@hatohui/models';
import { useArtworkDetails } from '@/hooks/useArtworkDetails';

export function ArtworkDetailList({ asset }: { asset: AssetDto }) {
  const details = useArtworkDetails(asset);

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-4 text-sm text-muted-foreground sm:grid-cols-4">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-medium text-foreground">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      {asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {asset.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
