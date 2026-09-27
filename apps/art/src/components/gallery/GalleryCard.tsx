'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FolderPlus, X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { useAssetManagement } from '@/hooks/useAssetUpload';
import { useGalleryTile } from '@/hooks/useGalleryTile';

export function GalleryCard({
  asset,
  isAdmin,
  href,
  onAddToProject,
}: {
  asset: AssetDto;
  isAdmin: boolean;
  href: string;
  onAddToProject: () => void;
}) {
  const { t } = useTranslation('art');
  const { remove, isDeleting } = useAssetManagement();
  const { tileStyle, frameStyle, sizes } = useGalleryTile(asset);

  return (
    <div
      data-reveal
      style={tileStyle}
      className="group relative overflow-hidden rounded-lg bg-card"
    >
      <div style={frameStyle} />
      <Link href={href} className="absolute inset-0">
        <Image
          src={asset.thumbnailUrl ?? asset.publicUrl}
          alt={asset.filename}
          fill
          sizes={sizes}
          className="object-cover transition-transform group-hover:scale-105"
        />
      </Link>
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={t('projects.addToProject')}
            onClick={onAddToProject}
          >
            <FolderPlus />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label={t('gallery.card.delete')}
            disabled={isDeleting}
            onClick={() => {
              if (window.confirm(t('gallery.card.deleteConfirm'))) {
                void remove(asset.id);
              }
            }}
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
