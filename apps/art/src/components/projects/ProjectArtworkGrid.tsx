'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { ProjectArtworkDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';

export function ProjectArtworkGrid({
  artworks,
  alt,
  onView,
  onRemove,
}: {
  artworks: ProjectArtworkDto[];
  alt: string;
  onView: (fullUrl: string) => void;
  onRemove?: (assetId: string) => void;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {artworks.map((artwork) => (
        <div
          key={artwork.assetId ?? artwork.fullUrl}
          className="group relative aspect-square overflow-hidden rounded-lg bg-card"
        >
          <button
            type="button"
            className="block h-full w-full cursor-zoom-in"
            aria-label={t('projects.viewFull')}
            onClick={() => onView(artwork.fullUrl)}
          >
            <Image
              src={artwork.thumbnailUrl}
              alt={alt}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          </button>
          {onRemove && artwork.assetId && (
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label={t('projects.removeFromProject')}
              className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              onClick={() => onRemove(artwork.assetId as string)}
            >
              <X />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
