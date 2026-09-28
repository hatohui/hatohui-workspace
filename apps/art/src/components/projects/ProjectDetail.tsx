'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { ProjectDto } from '@hatohui/models';
import { useImageViewer } from '@/hooks/useImageViewer';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { ProjectArtworkGrid } from './ProjectArtworkGrid';

export function ProjectDetail({
  project,
  backHref,
}: {
  project: ProjectDto;
  backHref: string;
}) {
  const { t } = useTranslation('art');
  const viewer = useImageViewer();

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('gallery.detail.back')}
      </Link>
      <header className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-serif text-3xl">{project.title}</h1>
          <span className="text-sm text-muted-foreground">
            {t('projects.pieces', { count: project.artworkCount })}
          </span>
        </div>
        {project.description && (
          <p className="max-w-2xl whitespace-pre-line text-muted-foreground">
            {project.description}
          </p>
        )}
      </header>
      {project.artworks.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          {t('projects.noArtYet')}
        </p>
      ) : (
        <ProjectArtworkGrid
          artworks={project.artworks}
          alt={project.title}
          onView={(artwork) =>
            viewer.open(artwork.fullUrl, {
              title: artwork.title,
              description: artwork.description,
            })
          }
        />
      )}
      <ImageViewer
        src={viewer.src}
        alt={viewer.caption.title ?? project.title}
        caption={viewer.caption}
        onClose={viewer.close}
      />
    </div>
  );
}
