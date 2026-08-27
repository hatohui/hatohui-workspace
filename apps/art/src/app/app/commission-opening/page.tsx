import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { CommissionOpeningPanel } from '@/components/commission/CommissionOpeningPanel';

export default async function CommissionOpeningPage() {
  const user = await getSessionUser();
  if (!user || !user.isArtist) {
    redirect('/app');
  }

  return <CommissionOpeningPanel />;
}
