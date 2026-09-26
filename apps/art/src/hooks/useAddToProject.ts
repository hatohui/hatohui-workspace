'use client';

import { useState } from 'react';
import { useAuth } from '@hatohui/libs';
import type { AssetDto } from '@hatohui/models';
import { useProjects } from './useProjects';
import { useProjectMutations } from './useProjectMutations';

export function useAddToProject(asset: AssetDto | null) {
  const { user } = useAuth();
  const { items } = useProjects(user?.id);
  const mutations = useProjectMutations();
  const [newTitle, setNewTitle] = useState('');
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const isIn = (projectId: string) =>
    added[projectId] ?? asset?.projectIds.includes(projectId) ?? false;

  return {
    projects: items.map((project) => ({
      id: project.id,
      title: project.title,
      checked: isIn(project.id),
    })),
    toggle: (projectId: string) => {
      if (!asset) return;
      const next = !isIn(projectId);
      setAdded((previous) => ({ ...previous, [projectId]: next }));
      if (next) void mutations.addAssets(projectId, [asset.id]);
      else mutations.removeAsset(projectId, asset.id);
    },
    newTitle,
    setNewTitle,
    createAndAdd: async () => {
      const title = newTitle.trim();
      if (!asset || !title) return;
      setNewTitle('');
      const project = await mutations.create(title);
      setAdded((previous) => ({ ...previous, [project.id]: true }));
      await mutations.addAssets(project.id, [asset.id]);
    },
    reset: () => setAdded({}),
  };
}
