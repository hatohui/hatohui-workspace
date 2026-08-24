'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { useAssetManagement } from '@/hooks/useAssetUpload';

export function GalleryCard({
  asset,
  isAdmin,
  onClick,
}: {
  asset: AssetDto;
  isAdmin: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('art');
  const { remove, isDeleting } = useAssetManagement();

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-card">
      <button
        type="button"
        onClick={onClick}
        className="block h-full w-full cursor-pointer"
      >
        <Image
          src={asset.thumbnailUrl ?? asset.publicUrl}
          alt={asset.filename}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </button>
      {isAdmin && (
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          disabled={isDeleting}
          onClick={() => {
            if (window.confirm(t('gallery.card.deleteConfirm'))) {
              void remove(asset.id);
            }
          }}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
