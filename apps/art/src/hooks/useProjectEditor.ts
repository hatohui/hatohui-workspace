'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WORKSPACE_PROJECTS_ROUTE } from '@/constants/projects';
import type { ProjectArtworkDto } from '@hatohui/models';
import { useImageViewer } from './useImageViewer';
import { useProject } from './useProjects';
import { useProjectMutations } from './useProjectMutations';

export function useProjectEditor(id: string) {
  const router = useRouter();
  const { project, isLoading } = useProject(id);
  const mutations = useProjectMutations();
  const viewer = useImageViewer();
  const [isAdding, setIsAdding] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const save = (fields: { title?: string; description?: string }) => {
    if (!project) return;
    const title = (fields.title ?? project.title).trim();
    if (!title) return;
    mutations.rename(id, {
      title,
      description: (fields.description ?? project.description ?? '') || null,
      brief: project.brief,
    });
  };

  return {
    project,
    isLoading,
    backHref: WORKSPACE_PROJECTS_ROUTE,
    linkedAssetIds: (project?.artworks ?? []).flatMap((artwork) =>
      artwork.assetId ? [artwork.assetId] : [],
    ),
    saveTitle: (title: string) => save({ title }),
    saveDescription: (description: string) => save({ description }),
    setPrivate: (isPrivate: boolean) => mutations.setPrivate(id, isPrivate),
    removeArtwork: (assetId: string) => mutations.removeAsset(id, assetId),
    viewer,
    view: (artwork: ProjectArtworkDto) =>
      viewer.open(
        artwork.previewUrl,
        { title: artwork.title, description: artwork.description },
        artwork.fullUrl,
      ),
    isAdding,
    setIsAdding,
    isConfirmingDelete,
    setIsConfirmingDelete,
    confirmDelete: async () => {
      setIsConfirmingDelete(false);
      await mutations.remove(id);
      router.push(WORKSPACE_PROJECTS_ROUTE);
    },
  };
}
