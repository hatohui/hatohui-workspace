'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@hatohui/libs';
import { WORKSPACE_PROJECTS_ROUTE } from '@/constants/projects';
import { useProjects } from './useProjects';
import { useProjectMutations } from './useProjectMutations';

export function useWorkspaceProjects() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, isLoading } = useProjects(user?.id);
  const mutations = useProjectMutations();
  const [isCreating, setIsCreating] = useState(false);

  return {
    items,
    isLoading,
    hrefFor: (id: string) => `${WORKSPACE_PROJECTS_ROUTE}/${id}`,
    isCreating,
    setIsCreating,
    create: async (title: string) => {
      const project = await mutations.create(title);
      setIsCreating(false);
      router.push(`${WORKSPACE_PROJECTS_ROUTE}/${project.id}`);
    },
  };
}
