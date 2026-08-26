import { getSessionUser } from '@/lib/session';
import { CommissionSettings } from '@/components/commission/CommissionSettings';

export default async function AdminPricingPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return <CommissionSettings artistId={user.id} />;
}
