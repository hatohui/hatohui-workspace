import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { GALLERY_PROJECTS_SECTION_QUERY } from '@/constants/gallery';
import { GALLERY_ROUTE } from '@/constants/navigation';
import { getSiteArtist } from '@/lib/artist';
import { loadProject } from '@/lib/project';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getSiteArtist();
  const project = await loadProject(id, artist.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ProjectDetail
        project={project}
        backHref={`${GALLERY_ROUTE}?${GALLERY_PROJECTS_SECTION_QUERY}`}
      />
    </main>
  );
}
