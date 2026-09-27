'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { ArtworkDetailList } from './ArtworkDetailList';
import { ArtworkImage } from './ArtworkImage';
import { ArtworkHeading } from './ArtworkHeading';
import { ArtworkDetailsEditor } from './ArtworkDetailsEditor';

export function ArtworkDetail({
  asset,
  backHref,
  editable = false,
}: {
  asset: AssetDto;
  backHref: string;
  editable?: boolean;
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
      <ArtworkImage asset={asset} />
      {editable ? (
        <ArtworkDetailsEditor asset={asset} />
      ) : (
        <ArtworkHeading asset={asset} />
      )}
      <ArtworkDetailList asset={asset} />
    </div>
  );
}
