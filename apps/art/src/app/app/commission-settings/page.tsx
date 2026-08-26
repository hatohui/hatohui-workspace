import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { CommissionSettings } from '@/components/commission/CommissionSettings';

export default async function CommissionSettingsPage() {
  const user = await getSessionUser();
  if (!user || !user.isArtist) {
    redirect('/app');
  }

  return <CommissionSettings artistId={user.id} />;
}
