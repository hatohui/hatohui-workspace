'use client';

import Image from 'next/image';
import type { AssetDto } from '@hatohui/models';
import {
  GALLERY_MOSAIC_FOCUS_POSITION,
  GALLERY_MOSAIC_SIZES,
} from '@/constants/gallery';
import { GalleryCardActions } from './GalleryCardActions';
import { GalleryCardSelectToggle } from './GalleryCardSelectToggle';
import { GalleryCardPrivateBadge } from './GalleryCardPrivateBadge';
import { AssetHoverDetails } from '@/components/shared/AssetHoverDetails';

export function GalleryCard({
  asset,
  isAdmin,
  onAddToProject,
  onEdit,
  onView,
  selection,
}: {
  asset: AssetDto;
  isAdmin: boolean;
  onAddToProject: () => void;
  onEdit: () => void;
  onView: () => void;
  selection?: { selected: boolean; onToggle: () => void };
}) {
  const image = (
    <Image
      src={asset.thumbnailUrl ?? asset.publicUrl}
      alt={asset.title ?? asset.filename}
      fill
      sizes={GALLERY_MOSAIC_SIZES}
      style={{ objectPosition: GALLERY_MOSAIC_FOCUS_POSITION }}
      className="object-cover transition-transform group-hover:scale-105"
    />
  );

  return (
    <div
      data-reveal
      className="group artwork-frame relative h-full overflow-hidden bg-card"
    >
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
        <button
          type="button"
          aria-label={asset.title ?? asset.filename}
          className="absolute inset-0 cursor-zoom-in focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          onClick={onView}
        >
          {image}
        </button>
      )}
      {!selection && <AssetHoverDetails asset={asset} />}
      {(asset.isPrivate || asset.inPrivateProject) && (
        <GalleryCardPrivateBadge viaProject={asset.inPrivateProject} />
      )}
      {isAdmin && !selection && (
        <GalleryCardActions
          assetId={asset.id}
          isPrivate={asset.isPrivate}
          isPrivateViaProject={asset.inPrivateProject}
          onEdit={onEdit}
          onAddToProject={onAddToProject}
        />
      )}
    </div>
  );
}
