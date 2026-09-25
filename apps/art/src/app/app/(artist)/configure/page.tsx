import { requireArtist } from '@/lib/session';
import { CommissionSettings } from '@/components/commission/CommissionSettings';

export default async function ConfigurePage() {
  const user = await requireArtist();
  return <CommissionSettings artistId={user.id} />;
}
