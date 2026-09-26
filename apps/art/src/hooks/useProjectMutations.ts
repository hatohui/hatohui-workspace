'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@hatohui/i18n';
import { useToast } from '@hatohui/ui';
import {
  getAssetsQueryKey,
  getProjectQueryKey,
  getProjectsQueryKey,
  useAddProjectAssets,
  useCreateProject,
  useDeleteProject,
  useRemoveProjectAsset,
  useUpdateProject,
  useUpdateProjectVisibility,
  type UpdateProjectDtoBrief,
} from '@hatohui/models';
import { EMPTY_PROJECT_BRIEF } from '@/constants/projects';

export function useProjectMutations() {
  const { t } = useTranslation('art');
  const toast = useToast();
  const queryClient = useQueryClient();

  const refresh = (projectId?: string) => {
    void queryClient.invalidateQueries({ queryKey: getProjectsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() });
    if (projectId) {
      void queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(projectId),
      });
    }
  };
  const failed = () => toast.error(t('projects.saveFailed'));

  const settle = {
    mutation: {
      onSettled: (_data: unknown, _error: unknown, vars: { id: string }) =>
        refresh(vars.id),
      onError: failed,
    },
  };

  const create = useCreateProject({
    mutation: { onSettled: () => refresh(), onError: failed },
  });
  const update = useUpdateProject(settle);
  const visibility = useUpdateProjectVisibility(settle);
  const remove = useDeleteProject(settle);
  const addAssets = useAddProjectAssets(settle);
  const removeAsset = useRemoveProjectAsset(settle);

  return {
    create: async (title: string) =>
      (
        await create.mutateAsync({
          data: { title, brief: EMPTY_PROJECT_BRIEF },
        })
      ).data,
    rename: (
      id: string,
      fields: { title: string; description: string | null; brief: unknown },
    ) =>
      update.mutate({
        id,
        data: {
          title: fields.title,
          description: fields.description ?? undefined,
          brief: (fields.brief ?? EMPTY_PROJECT_BRIEF) as UpdateProjectDtoBrief,
        },
      }),
    setHidden: (id: string, isHidden: boolean) =>
      visibility.mutate({ id, data: { isHidden } }),
    remove: (id: string) => remove.mutateAsync({ id }),
    addAssets: (id: string, assetIds: string[]) =>
      addAssets.mutateAsync({ id, data: { assetIds } }),
    removeAsset: (id: string, assetId: string) =>
      removeAsset.mutate({ id, assetId }),
  };
}
