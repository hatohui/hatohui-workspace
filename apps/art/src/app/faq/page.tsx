import { artistFaq } from '@hatohui/models';
import '@/lib/api';
import { FaqList } from '@/components/faq/FaqList';

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const faq = await artistFaq();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <FaqList items={faq.data.items} />
    </main>
  );
}
