'use client';

import Link from 'next/link';
import { useTranslation } from '@hatohui/i18n';
import type { ArtistAboutDto, PublicUserDto } from '@hatohui/models';
import { Avatar, Button } from '@hatohui/ui';
import { COMMISSION_ROUTE, GALLERY_ROUTE } from '@/constants/navigation';
import { LandingCommissionStatus } from './LandingCommissionStatus';
import { LandingName } from './LandingName';

export function LandingHero({
  artist,
  about,
}: {
  artist: PublicUserDto;
  about: ArtistAboutDto;
}) {
  const { t } = useTranslation('art');

  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-6 py-16 text-center">
      <div data-landing="avatar" className="relative">
        <span
          data-landing="ring"
          className="absolute -inset-3 rounded-full border-2 border-dashed border-primary/60"
        />
        <Avatar
          src={artist.avatarUrl}
          alt={artist.name}
          className="size-24 sm:size-28"
        />
      </div>
      <div className="space-y-3">
        <p
          data-landing="fade"
          className="text-xs tracking-[0.25em] text-muted-foreground uppercase"
        >
          {t('landing.greeting')}
        </p>
        <LandingName name={artist.name} />
        <p
          data-landing="fade"
          className="font-serif text-xl text-primary italic sm:text-2xl"
        >
          {about.headline}
        </p>
        <p
          data-landing="fade"
          className="mx-auto max-w-lg text-muted-foreground"
        >
          {about.intro}
        </p>
      </div>
      <div data-landing="fade">
        <LandingCommissionStatus artistId={artist.id} />
      </div>
      <div data-landing="fade" className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={GALLERY_ROUTE}>{t('landing.viewGallery')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={COMMISSION_ROUTE}>{t('landing.commission')}</Link>
        </Button>
      </div>
    </section>
  );
}
