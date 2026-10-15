'use client';

import Image from 'next/image';
import type { AssetDto } from '@hatohui/models';
import { useGalleryTile } from '@/hooks/useGalleryTile';
import { AssetHoverDetails } from '@/components/shared/AssetHoverDetails';

export function CommissionExampleTile({
  asset,
  onView,
}: {
  asset: AssetDto;
  onView: () => void;
}) {
  const { tileStyle, frameStyle, sizes } = useGalleryTile(asset);

  return (
    <button
      type="button"
      style={tileStyle}
      className="group relative block w-full overflow-hidden rounded-lg bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      onClick={onView}
    >
      <div style={frameStyle} />
      <Image
        src={asset.thumbnailUrl ?? asset.publicUrl}
        alt={asset.title ?? asset.filename}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <AssetHoverDetails asset={asset} />
    </button>
  );
}
