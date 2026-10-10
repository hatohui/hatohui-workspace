import { OrderDetail } from '@/components/orders/OrderDetail';

export default async function QueueDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <OrderDetail code={code} />
    </main>
  );
}
