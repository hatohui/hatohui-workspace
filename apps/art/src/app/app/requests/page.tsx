import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { CommissionRequestsView } from '@/components/requests/CommissionRequestsView';

export default async function CommissionRequestsPage() {
  const user = await getSessionUser();
  if (!user || !user.isArtist) {
    redirect('/app');
  }

  return <CommissionRequestsView />;
}
