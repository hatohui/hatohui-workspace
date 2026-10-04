'use client';

import Image from 'next/image';
import type { AssetDto } from '@hatohui/models';
import { useGalleryTile } from '@/hooks/useGalleryTile';
import type { ImageViewerCaption } from '@/hooks/useImageViewer';
import { AssetHoverDetails } from '@/components/shared/AssetHoverDetails';

export function CommissionExampleTile({
  asset,
  onView,
}: {
  asset: AssetDto;
  onView: (
    src: string,
    caption: ImageViewerCaption,
    originalUrl: string,
  ) => void;
}) {
  const { tileStyle, frameStyle, sizes } = useGalleryTile(asset);

  return (
    <button
      type="button"
      style={tileStyle}
      className="group relative block w-full overflow-hidden rounded-lg bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      onClick={() =>
        onView(
          asset.previewUrl ?? asset.publicUrl,
          { title: asset.title, description: asset.description },
          asset.publicUrl,
        )
      }
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
