import Image from 'next/image';
import Link from 'next/link';
import type { AssetDto } from '@hatohui/models';
import { GALLERY_ROUTE } from '@/constants/navigation';
import { LANDING_TILE_SIZES } from '@/constants/landing';

export function LandingArtworkTile({ asset }: { asset: AssetDto }) {
  return (
    <Link
      href={`${GALLERY_ROUTE}/${asset.id}`}
      data-landing="tile"
      className="group artwork-frame relative block aspect-square overflow-hidden bg-card transition-[translate] duration-300 hover:-translate-y-1.5"
    >
      <Image
        src={asset.thumbnailUrl ?? asset.publicUrl}
        alt={asset.title ?? asset.filename}
        fill
        sizes={LANDING_TILE_SIZES}
        className="object-cover transition-transform group-hover:scale-105"
      />
    </Link>
  );
}
