import Image from 'next/image';
import type { ProjectDto } from '@hatohui/models';

export function ProjectDetail({ project }: { project: ProjectDto }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">{project.title}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {project.deliverableAssets.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-lg bg-card"
          >
            <Image
              src={url}
              alt={project.title}
              fill
              sizes="33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
