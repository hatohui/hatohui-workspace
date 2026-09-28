'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { ProjectArtworkDto } from '@hatohui/models';
import { Button } from '@hatohui/ui';
import { useGalleryTile } from '@/hooks/useGalleryTile';

export function ProjectArtworkTile({
  artwork,
  alt,
  onView,
  onRemove,
}: {
  artwork: ProjectArtworkDto;
  alt: string;
  onView: () => void;
  onRemove?: () => void;
}) {
  const { t } = useTranslation('art');
  const { tileStyle, frameStyle, sizes } = useGalleryTile(artwork);

  return (
    <div
      data-reveal
      style={tileStyle}
      className="group artwork-frame relative overflow-hidden rounded-lg bg-card"
    >
      <div style={frameStyle} />
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-in focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={t('projects.viewFull')}
        onClick={onView}
      >
        <Image
          src={artwork.thumbnailUrl}
          alt={artwork.title ?? alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform group-hover:scale-105"
        />
      </button>
      {artwork.title && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 translate-y-1 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-2 pt-10 pb-2 text-sm leading-snug font-medium text-white opacity-0 transition duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          {artwork.title}
        </p>
      )}
      {onRemove && (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label={t('projects.removeFromProject')}
          title={t('projects.removeFromProject')}
          className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          onClick={onRemove}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
