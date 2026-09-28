import { notFound } from 'next/navigation';
import { project, ApiError, type ProjectDto } from '@hatohui/models';
import '@/lib/api';
import { withSession } from '@/lib/session';

export async function loadProject(
  id: string,
  ownerId: string,
): Promise<ProjectDto> {
  const response = await project(id, await withSession()).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );
  if (response.data.artistId !== ownerId) notFound();
  return response.data;
}
