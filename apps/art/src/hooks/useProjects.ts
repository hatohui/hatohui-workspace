'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  useProjects as useProjectsQuery,
  useProject as useProjectQuery,
  useCreateProject,
  useUpdateProject,
  useUpdateProjectVisibility,
  useDeleteProject,
  getProjectsQueryKey,
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

export function useProjectsAdmin(artistId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getProjectsQueryKey({ artistId }),
    });

  const listQuery = useProjectsQuery({ artistId });
  const create = useCreateProject({ mutation: { onSuccess: invalidate } });
  const update = useUpdateProject({ mutation: { onSuccess: invalidate } });
  const updateVisibility = useUpdateProjectVisibility({
    mutation: { onSuccess: invalidate },
  });
  const remove = useDeleteProject({ mutation: { onSuccess: invalidate } });

  return {
    items: listQuery.data?.data ?? [],
    isLoading: listQuery.isPending,
    create: create.mutateAsync,
    update: update.mutateAsync,
    updateVisibility: updateVisibility.mutateAsync,
    remove: (id: string) => remove.mutateAsync({ id }),
  };
}
