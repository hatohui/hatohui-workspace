import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { GALLERY_PROJECTS_SECTION_QUERY } from '@/constants/gallery';
import { resolveArtist } from '@/lib/artist';
import { loadProject } from '@/lib/project';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ artist: string; id: string }>;
}) {
  const { artist, id } = await params;
  const artistUser = await resolveArtist(artist);
  const project = await loadProject(id, artistUser.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ProjectDetail
        project={project}
        backHref={`/${artist}?${GALLERY_PROJECTS_SECTION_QUERY}`}
      />
    </main>
  );
}
