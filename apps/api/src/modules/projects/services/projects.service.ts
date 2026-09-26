import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { AuthService } from '@/modules/auth/services/auth.service';
import { type Prisma, type User } from '@prisma/client';
import {
  CreateProjectDto,
  ProjectArtworkDto,
  ProjectDto,
  UpdateProjectDto,
  UpdateProjectVisibilityDto,
} from '@/modules/projects/dto/project.dto';

const artworksInclude = {
  artworks: {
    where: { isFinal: true },
    select: { images: true },
  },
  assets: {
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    include: { asset: true },
  },
} satisfies Prisma.ProjectInclude;

type ProjectWithArtworks = Prisma.ProjectGetPayload<{
  include: typeof artworksInclude;
}>;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly db: Database,
    private readonly auth: AuthService,
  ) {}

  async list(viewer: User | null, artistId?: string): Promise<ProjectDto[]> {
    const isOwner = !!viewer && !!artistId && viewer.id === artistId;
    const canSeeHidden = isOwner || (await this.auth.isAdmin(viewer));
    const projects = await this.db.project.findMany({
      where: {
        ...(artistId ? { artistId } : {}),
        ...(canSeeHidden ? {} : { isHidden: false }),
      },
      orderBy: { createdAt: 'desc' },
      include: artworksInclude,
    });
    return projects.map(toProjectDto);
  }

  async findOne(id: string, viewer: User | null): Promise<ProjectDto> {
    const project = await this.findOrThrow(id);
    const isOwner = viewer?.id === project.artistId;
    if (project.isHidden && !isOwner && !(await this.auth.isAdmin(viewer))) {
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

  async addAssets(
    artistId: string,
    id: string,
    assetIds: string[],
  ): Promise<ProjectDto> {
    await this.assertOwned(artistId, id);
    const unique = [...new Set(assetIds)];
    const owned = await this.db.asset.count({
      where: { id: { in: unique }, uploadedById: artistId },
    });
    if (owned !== unique.length) {
      throw new BadRequestException('Only your own gallery art can be added');
    }

    const last = await this.db.projectAsset.aggregate({
      where: { projectId: id },
      _max: { position: true },
    });
    const start = (last._max.position ?? -1) + 1;
    await this.db.projectAsset.createMany({
      data: unique.map((assetId, index) => ({
        projectId: id,
        assetId,
        position: start + index,
      })),
      skipDuplicates: true,
    });
    return toProjectDto(await this.findOrThrow(id));
  }

  async removeAsset(
    artistId: string,
    id: string,
    assetId: string,
  ): Promise<ProjectDto> {
    await this.assertOwned(artistId, id);
    await this.db.projectAsset.deleteMany({
      where: { projectId: id, assetId },
    });
    return toProjectDto(await this.findOrThrow(id));
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

function toArtworks(project: ProjectWithArtworks): ProjectArtworkDto[] {
  const fromAssets = project.assets.map(({ asset }) => ({
    assetId: asset.id,
    thumbnailUrl: asset.thumbnailUrl ?? asset.publicUrl,
    fullUrl: asset.publicUrl,
  }));
  const linked = new Set(fromAssets.map((artwork) => artwork.fullUrl));
  const legacy = project.artworks
    .flatMap((artwork) => artwork.images)
    .filter((url) => !linked.has(url))
    .map((url) => ({ assetId: null, thumbnailUrl: url, fullUrl: url }));
  return [...fromAssets, ...legacy];
}

function toProjectDto(project: ProjectWithArtworks): ProjectDto {
  const artworks = toArtworks(project);
  const artworkImages = artworks.map((artwork) => artwork.fullUrl);
  return {
    id: project.id,
    artistId: project.artistId,
    title: project.title,
    description: project.description,
    brief: project.brief,
    isHidden: project.isHidden,
    coverImageUrl: artworks[0]?.thumbnailUrl ?? null,
    artworkCount: artworks.length,
    artworkImages,
    artworks,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
