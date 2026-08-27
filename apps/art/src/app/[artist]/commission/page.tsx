import { CommissionForm } from '@/components/commission/CommissionForm';
import { resolveArtist } from '@/lib/artist';

export default async function CommissionPage({
  params,
}: {
  params: Promise<{ artist: string }>;
}) {
  const { artist } = await params;
  const artistUser = await resolveArtist(artist);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <CommissionForm artistId={artistUser.id} />
    </main>
  );
}
