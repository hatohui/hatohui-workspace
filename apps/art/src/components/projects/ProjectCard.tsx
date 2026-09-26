'use client';

import Link from 'next/link';
import Image from 'next/image';
import { EyeOff } from 'lucide-react';
import { useTranslation } from '@hatohui/i18n';
import type { ProjectDto } from '@hatohui/models';

export function ProjectCard({
  project,
  href,
  showHidden = false,
}: {
  project: ProjectDto;
  href: string;
  showHidden?: boolean;
}) {
  const { t } = useTranslation('art');

  return (
    <Link
      href={href}
      className="group relative block aspect-square overflow-hidden rounded-lg bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {project.coverImageUrl ? (
        <Image
          src={project.coverImageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
          {t('projects.noArtYet')}
        </div>
      )}
      {showHidden && project.isHidden && (
        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs">
          <EyeOff className="size-3" aria-hidden />
          {t('projects.hidden')}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-sm font-medium text-white">{project.title}</p>
        <p className="text-xs text-white/80">
          {t('projects.pieces', { count: project.artworkCount })}
        </p>
      </div>
    </Link>
  );
}
