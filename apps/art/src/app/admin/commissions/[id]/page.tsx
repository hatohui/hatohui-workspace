import { CommissionDetailAdmin } from '@/components/commission/CommissionDetailAdmin';

export default async function AdminCommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommissionDetailAdmin id={id} />;
}
