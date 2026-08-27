'use client';

import { useTranslation } from '@hatohui/i18n';
import { useProjects } from '@/hooks/useProjects';
import { useStaggerReveal } from '@/hooks/useStaggerReveal';
import { ProjectCard } from './ProjectCard';

export function ProjectsSection({ artistId }: { artistId?: string }) {
  const { t } = useTranslation('art');
  const { items, isLoading } = useProjects(artistId);
  const gridRef = useStaggerReveal<HTMLDivElement>('[data-reveal]', [items]);

  if (isLoading)
    return <p className="text-muted-foreground">{t('common:loading')}</p>;
  if (items.length === 0) {
    return (
      <p className="mt-10 text-center text-muted-foreground">
        {t('projects.empty')}
      </p>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
    >
      {items.map((project) => (
        <div key={project.id} data-reveal>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
