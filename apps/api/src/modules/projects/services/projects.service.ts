import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { AuthService } from '@/modules/auth/services/auth.service';
import { type Project, type Prisma, type User } from '@prisma/client';
import {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
  UpdateProjectVisibilityDto,
} from '@/modules/projects/dto/project.dto';

const artworksInclude = {
  artworks: {
    where: { isFinal: true },
    select: { images: true },
  },
} satisfies Prisma.ProjectInclude;

type ProjectWithArtworks = Project & {
  artworks: { images: string[] }[];
};

@Injectable()
export class ProjectsService {
  constructor(
    private readonly db: Database,
    private readonly auth: AuthService,
  ) {}

  async list(viewer: User | null, artistId?: string): Promise<ProjectDto[]> {
    const isAdmin = await this.auth.isAdmin(viewer);
    const projects = await this.db.project.findMany({
      where: {
        ...(artistId ? { artistId } : {}),
        ...(isAdmin ? {} : { isHidden: false }),
      },
      orderBy: { createdAt: 'desc' },
      include: artworksInclude,
    });
    return projects.map(toProjectDto);
  }

  async findOne(id: string, viewer: User | null): Promise<ProjectDto> {
    const project = await this.findOrThrow(id);
    if (project.isHidden && !(await this.auth.isAdmin(viewer))) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return toProjectDto(project);
  }

  async create(artistId: string, dto: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.db.project.create({
      data: {
        artistId,
        title: dto.title,
        description: dto.description ?? null,
        brief: dto.brief ?? undefined,
      },
      include: artworksInclude,
    });
    return toProjectDto(project);
  }

  async update(
    artistId: string,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    await this.assertOwned(artistId, id);
    const project = await this.db.project.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description ?? null,
        brief: dto.brief ?? undefined,
      },
      include: artworksInclude,
    });
    return toProjectDto(project);
  }

  async updateVisibility(
    artistId: string,
    id: string,
    dto: UpdateProjectVisibilityDto,
  ): Promise<ProjectDto> {
    await this.assertOwned(artistId, id);
    const project = await this.db.project.update({
      where: { id },
      data: { isHidden: dto.isHidden },
      include: artworksInclude,
    });
    return toProjectDto(project);
  }

  async remove(artistId: string, id: string): Promise<void> {
    await this.assertOwned(artistId, id);
    await this.db.project.delete({ where: { id } });
  }

  private async findOrThrow(id: string): Promise<ProjectWithArtworks> {
    const project = await this.db.project.findUnique({
      where: { id },
      include: artworksInclude,
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  private async assertOwned(artistId: string, id: string): Promise<void> {
    const project = await this.db.project.findUnique({ where: { id } });
    if (!project || project.artistId !== artistId) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}

function toProjectDto(project: ProjectWithArtworks): ProjectDto {
  const artworkImages = project.artworks.flatMap((artwork) => artwork.images);
  return {
    id: project.id,
    artistId: project.artistId,
    title: project.title,
    description: project.description,
    brief: project.brief,
    isHidden: project.isHidden,
    coverImageUrl: artworkImages[0] ?? null,
    artworkCount: project.artworks.length,
    artworkImages,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
