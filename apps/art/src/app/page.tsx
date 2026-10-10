import { artistAbout, assets } from '@hatohui/models';
import '@/lib/api';
import { LandingPage } from '@/components/landing/LandingPage';
import { LANDING_RECENT_WORK_COUNT } from '@/constants/landing';
import { getSiteArtist } from '@/lib/artist';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const artist = await getSiteArtist();
  const [about, recent] = await Promise.all([
    artistAbout(),
    assets({
      page: 1,
      pageSize: LANDING_RECENT_WORK_COUNT,
      uploadedById: artist.id,
    }),
  ]);

  return (
    <LandingPage
      artist={artist}
      about={about.data}
      recent={recent.data.items}
    />
  );
}
