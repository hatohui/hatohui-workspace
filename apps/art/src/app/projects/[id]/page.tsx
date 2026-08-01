import { notFound } from 'next/navigation';
import { project, ApiError } from '@hatohui/models';
import '@/lib/api';
import { ProjectDetail } from '@/components/projects/ProjectDetail';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const response = await project(id);
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <ProjectDetail project={response.data} />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
