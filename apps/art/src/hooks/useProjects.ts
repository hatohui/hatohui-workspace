'use client';

import {
  useProjects as useProjectsQuery,
  useProject as useProjectQuery,
  type ProjectDto,
} from '@hatohui/models';

export function useProjects(artistId?: string, initialItems?: ProjectDto[]) {
  const query = useProjectsQuery(
    { artistId },
    {
      query: {
        initialData: initialItems
          ? { data: initialItems, status: 200 as const, headers: new Headers() }
          : undefined,
      },
    },
  );
  return {
    items: query.data?.data ?? [],
    isLoading: query.isPending,
  };
}

export function useProject(id: string) {
  const query = useProjectQuery(id);
  return {
    project: query.data?.data,
    isLoading: query.isPending,
  };
}
