'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import { Button, Skeleton } from '@hatohui/ui';
import { useWorkspaceProjects } from '@/hooks/useWorkspaceProjects';
import { ProjectCard } from './ProjectCard';
import { NewProjectDialog } from './NewProjectDialog';

export function WorkspaceProjects() {
  const { t } = useTranslation('art');
  const projects = useWorkspaceProjects();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl">{t('projects.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('projects.subtitle')}
          </p>
        </div>
        <Button onClick={() => projects.setIsCreating(true)}>
          <Plus className="size-4" aria-hidden />
          {t('projects.newProject')}
        </Button>
      </header>

      {projects.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : projects.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          {t('projects.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {projects.items.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={projects.hrefFor(project.id)}
              showHidden
            />
          ))}
        </div>
      )}

      <NewProjectDialog
        open={projects.isCreating}
        onOpenChange={projects.setIsCreating}
        onCreate={projects.create}
      />
    </div>
  );
}
