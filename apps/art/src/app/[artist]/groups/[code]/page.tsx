import { GroupView } from '@/components/groups/GroupView';

export default async function GroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <GroupView code={code} />
    </main>
  );
}
