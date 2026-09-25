import { redirect } from 'next/navigation';
import { getArtistSetup, getSessionUser } from '@/lib/session';
import { SETUP_ROUTE } from '@/constants/setup';
import { AppDashboard } from '@/components/layout/AppDashboard';
import { ArtistDashboard } from '@/components/dashboard/ArtistDashboard';

export default async function AppDashboardPage() {
  const user = await getSessionUser();
  if (!user?.isArtist) return <AppDashboard />;

  const setup = await getArtistSetup();
  if (setup?.shouldShow) redirect(SETUP_ROUTE);

  return <ArtistDashboard />;
}
