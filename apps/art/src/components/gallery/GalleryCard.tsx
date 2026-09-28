'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { AssetDto } from '@hatohui/models';
import { useGalleryTile } from '@/hooks/useGalleryTile';
import { GalleryCardActions } from './GalleryCardActions';
import { GalleryCardSelectToggle } from './GalleryCardSelectToggle';
import { GalleryCardZoomButton } from './GalleryCardZoomButton';
import { GalleryCardPrivateBadge } from './GalleryCardPrivateBadge';
import { AssetHoverDetails } from '@/components/shared/AssetHoverDetails';

export function GalleryCard({
  asset,
  isAdmin,
  href,
  onAddToProject,
  onEdit,
  onZoom,
  selection,
}: {
  asset: AssetDto;
  isAdmin: boolean;
  href: string;
  onAddToProject: () => void;
  onEdit: () => void;
  onZoom: () => void;
  selection?: { selected: boolean; onToggle: () => void };
}) {
  const { tileStyle, frameStyle, sizes } = useGalleryTile(asset);
  const image = (
    <Image
      src={asset.thumbnailUrl ?? asset.publicUrl}
      alt={asset.title ?? asset.filename}
      fill
      sizes={sizes}
      className="object-cover transition-transform group-hover:scale-105"
    />
  );

  return (
    <div
      data-reveal
      style={tileStyle}
      className="group relative overflow-hidden rounded-lg bg-card"
    >
      <div style={frameStyle} />
      {selection ? (
        <>
          {image}
          <GalleryCardSelectToggle
            filename={asset.filename}
            selected={selection.selected}
            onToggle={selection.onToggle}
          />
        </>
      ) : (
        <Link href={href} className="absolute inset-0">
          {image}
        </Link>
      )}
      {!selection && <AssetHoverDetails asset={asset} />}
      {!selection && <GalleryCardZoomButton onZoom={onZoom} />}
      {(asset.isPrivate || asset.inPrivateProject) && (
        <GalleryCardPrivateBadge viaProject={!asset.isPrivate} />
      )}
      {isAdmin && !selection && (
        <GalleryCardActions
          assetId={asset.id}
          isPrivate={asset.isPrivate}
          onEdit={onEdit}
          onAddToProject={onAddToProject}
        />
      )}
    </div>
  );
}
