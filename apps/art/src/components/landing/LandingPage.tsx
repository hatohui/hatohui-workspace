'use client';

import type { ArtistAboutDto, AssetDto, PublicUserDto } from '@hatohui/models';
import { useLandingAnimation } from '@/hooks/useLandingAnimation';
import { LandingBackdrop } from './LandingBackdrop';
import { LandingHero } from './LandingHero';
import { LandingFacts } from './LandingFacts';
import { LandingStory } from './LandingStory';
import { LandingRecentWork } from './LandingRecentWork';

export function LandingPage({
  artist,
  about,
  recent,
}: {
  artist: PublicUserDto;
  about: ArtistAboutDto;
  recent: AssetDto[];
}) {
  const ref = useLandingAnimation<HTMLDivElement>();

  return (
    <div ref={ref} className="relative overflow-hidden">
      <LandingBackdrop />
      <main className="relative mx-auto max-w-6xl px-6">
        <LandingHero artist={artist} about={about} />
        <LandingFacts facts={about.facts} />
        <LandingStory body={about.body} />
        <LandingRecentWork items={recent} />
      </main>
    </div>
  );
}
