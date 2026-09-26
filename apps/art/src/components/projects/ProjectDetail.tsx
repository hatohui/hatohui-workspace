'use client';

import type { ProjectDto } from '@hatohui/models';
import { useImageViewer } from '@/hooks/useImageViewer';
import { ImageViewer } from '@/components/shared/ImageViewer';
import { ProjectArtworkGrid } from './ProjectArtworkGrid';

export function ProjectDetail({ project }: { project: ProjectDto }) {
  const viewer = useImageViewer();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">{project.title}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>
      <ProjectArtworkGrid
        artworks={project.artworks}
        alt={project.title}
        onView={viewer.open}
      />
      <ImageViewer
        src={viewer.src}
        alt={project.title}
        onClose={viewer.close}
      />
    </div>
  );
}
