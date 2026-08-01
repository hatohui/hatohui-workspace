'use client';

import { useTranslation } from '@hatohui/i18n';
import type { ProjectDto } from '@hatohui/models';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';

export function ProjectsGrid({ initialItems }: { initialItems: ProjectDto[] }) {
  const { t } = useTranslation('art');
  const { items } = useProjects(initialItems);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 font-serif text-3xl">{t('projects.title')}</h1>

      {items.length === 0 && (
        <p className="text-muted-foreground">{t('projects.empty')}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </main>
  );
}
