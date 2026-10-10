import { QueuePageContent } from '@/components/queue/QueuePageContent';
import { getSiteArtist } from '@/lib/artist';

export default async function QueuePage() {
  const artist = await getSiteArtist();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <QueuePageContent artistId={artist.id} />
    </main>
  );
}
