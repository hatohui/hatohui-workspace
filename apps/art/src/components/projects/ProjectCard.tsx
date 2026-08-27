'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import type { ProjectDto } from '@hatohui/models';

export function ProjectCard({ project }: { project: ProjectDto }) {
  const { artist } = useParams<{ artist: string }>();

  return (
    <Link
      href={`/${artist}/projects/${project.id}`}
      className="group relative aspect-square overflow-hidden rounded-lg bg-card"
    >
      {project.coverImageUrl ? (
        <Image
          src={project.coverImageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          {project.title}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-sm font-medium text-white">{project.title}</p>
      </div>
    </Link>
  );
}
