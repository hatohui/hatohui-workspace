import Image from 'next/image';
import type { AssetDto } from '@hatohui/models';
import { LANDING_TILE_SIZES } from '@/constants/landing';

export function LandingArtworkTile({
  asset,
  onView,
}: {
  asset: AssetDto;
  onView: () => void;
}) {
  return (
    <button
      type="button"
      data-landing="tile"
      aria-label={asset.title ?? asset.filename}
      onClick={onView}
      className="group artwork-frame relative block aspect-square cursor-zoom-in overflow-hidden bg-card transition-[translate] duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-1.5"
    >
      <Image
        src={asset.thumbnailUrl ?? asset.publicUrl}
        alt={asset.title ?? asset.filename}
        fill
        sizes={LANDING_TILE_SIZES}
        className="object-cover transition-transform motion-safe:group-hover:scale-105"
      />
    </button>
  );
}
