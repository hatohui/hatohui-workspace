import { getSessionUser } from '@/lib/session';
import { AppDashboard } from '@/components/layout/AppDashboard';
import { ArtistDashboard } from '@/components/dashboard/ArtistDashboard';

export default async function AppDashboardPage() {
  const user = await getSessionUser();
  return user?.isArtist ? <ArtistDashboard /> : <AppDashboard />;
}
