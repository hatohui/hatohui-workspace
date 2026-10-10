import { CommissionIntake } from '@/components/commission/CommissionIntake';
import { getSiteArtist } from '@/lib/artist';

export default async function CommissionPage() {
  const artist = await getSiteArtist();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <CommissionIntake artistId={artist.id} artistName={artist.name} />
    </main>
  );
}
