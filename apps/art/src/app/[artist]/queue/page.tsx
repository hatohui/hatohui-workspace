import { QueuePageContent } from '@/components/queue/QueuePageContent';
import { resolveArtist } from '@/lib/artist';

export default async function QueuePage({
  params,
}: {
  params: Promise<{ artist: string }>;
}) {
  const { artist } = await params;
  const artistUser = await resolveArtist(artist);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <QueuePageContent artistId={artistUser.id} />
    </main>
  );
}
