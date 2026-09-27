'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { ARTWORK_FALLBACK_DIMENSION_PX } from '@/constants/gallery';
import { ArtworkDetailList } from './ArtworkDetailList';

export function ArtworkDetail({
  asset,
  backHref,
}: {
  asset: AssetDto;
  backHref: string;
}) {
  const { t } = useTranslation('art');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft />
          {t('gallery.detail.back')}
        </Link>
        <a
          href={asset.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {t('gallery.detail.openOriginal')}
          <ExternalLink />
        </a>
      </div>
      <div className="flex justify-center rounded-lg bg-card">
        <Image
          src={asset.publicUrl}
          alt={asset.filename}
          width={asset.width ?? ARTWORK_FALLBACK_DIMENSION_PX}
          height={asset.height ?? ARTWORK_FALLBACK_DIMENSION_PX}
          sizes="100vw"
          priority
          className="h-auto max-h-[calc(100vh-12rem)] w-auto max-w-full object-contain"
        />
      </div>
      <ArtworkDetailList asset={asset} />
    </div>
  );
}
