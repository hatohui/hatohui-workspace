import { CommissionIntake } from '@/components/commission/CommissionIntake';
import { DoodleBackdrop } from '@/components/decor/DoodleBackdrop';
import { COMMISSION_DOODLE_FIELD } from '@/constants/decor';
import { getSiteArtist } from '@/lib/artist';

export default async function CommissionPage() {
  const artist = await getSiteArtist();

  return (
    <div className="relative isolate">
      <DoodleBackdrop field={COMMISSION_DOODLE_FIELD} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <CommissionIntake artistId={artist.id} artistName={artist.name} />
      </main>
    </div>
  );
}
