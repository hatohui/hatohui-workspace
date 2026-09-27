import { ArtworkDetail } from '@/components/gallery/ArtworkDetail';
import { loadArtwork } from '@/lib/artwork';
import { resolveArtist } from '@/lib/artist';

export const dynamic = 'force-dynamic';

export default async function ArtistArtworkPage({
  params,
}: {
  params: Promise<{ artist: string; id: string }>;
}) {
  const { artist, id } = await params;
  const artistUser = await resolveArtist(artist);
  const artwork = await loadArtwork(id, artistUser.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ArtworkDetail asset={artwork} backHref={`/${artist}`} />
    </main>
  );
}
