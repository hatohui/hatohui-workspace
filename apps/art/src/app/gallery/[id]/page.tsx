import { ArtworkDetail } from '@/components/gallery/ArtworkDetail';
import { GALLERY_ROUTE } from '@/constants/navigation';
import { loadArtwork } from '@/lib/artwork';
import { getSiteArtist } from '@/lib/artist';

export const dynamic = 'force-dynamic';

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getSiteArtist();
  const artwork = await loadArtwork(id, artist.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ArtworkDetail asset={artwork} backHref={GALLERY_ROUTE} />
    </main>
  );
}
