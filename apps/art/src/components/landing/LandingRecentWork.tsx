'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { AssetDto } from '@hatohui/models';
import { GALLERY_ROUTE } from '@/constants/navigation';
import { LandingArtworkTile } from './LandingArtworkTile';

export function LandingRecentWork({ items }: { items: AssetDto[] }) {
  const { t } = useTranslation('art');

  if (items.length === 0) return null;

  return (
    <section className="space-y-5 pb-20">
      <div
        data-landing="reveal"
        className="flex items-end justify-between gap-4"
      >
        <h2 className="font-serif text-2xl">{t('landing.recentWork')}</h2>
        <Link
          href={GALLERY_ROUTE}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {t('landing.viewAll')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div
        data-landing="tiles"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {items.map((asset) => (
          <LandingArtworkTile key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}
