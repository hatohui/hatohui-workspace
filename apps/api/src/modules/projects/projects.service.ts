import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/libs/db';
import { Role, type Project, type User } from '@prisma/client';
import {
  CreateProjectDto,
  ProjectDto,
  UpdateProjectDto,
  UpdateProjectVisibilityDto,
} from './dto/project.dto';

type ProjectWithCommissions = Project & {
  commissions: { deliverableAssets: string[] }[];
};

@Injectable()
export class ProjectsService {
  constructor(private readonly db: Database) {}

  async list(viewer: User | null): Promise<ProjectDto[]> {
    const projects = await this.db.project.findMany({
      where: viewer?.role === Role.ADMIN ? {} : { isHidden: false },
      orderBy: { createdAt: 'desc' },
      include: { commissions: { select: { deliverableAssets: true } } },
    });
    return projects.map(toProjectDto);
  }

  async findOne(id: string, viewer: User | null): Promise<ProjectDto> {
    const project = await this.findOrThrow(id);
    if (project.isHidden && viewer?.role !== Role.ADMIN) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return toProjectDto(project);
  }

  async create(dto: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.db.project.create({
      data: { title: dto.title, description: dto.description ?? null },
      include: { commissions: { select: { deliverableAssets: true } } },
    });
    return toProjectDto(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    await this.assertExists(id);
    const project = await this.db.project.update({
      where: { id },
      data: { title: dto.title, description: dto.description ?? null },
      include: { commissions: { select: { deliverableAssets: true } } },
    });
    return toProjectDto(project);
  }

  async updateVisibility(
    id: string,
    dto: UpdateProjectVisibilityDto,
  ): Promise<ProjectDto> {
    await this.assertExists(id);
    const project = await this.db.project.update({
      where: { id },
      data: { isHidden: dto.isHidden },
      include: { commissions: { select: { deliverableAssets: true } } },
    });
    return toProjectDto(project);
  }

  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.db.project.delete({ where: { id } });
  }

  private async findOrThrow(id: string): Promise<ProjectWithCommissions> {
    const project = await this.db.project.findUnique({
      where: { id },
      include: { commissions: { select: { deliverableAssets: true } } },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  private async assertExists(id: string): Promise<void> {
    const project = await this.db.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}

function toProjectDto(project: ProjectWithCommissions): ProjectDto {
  const deliverableAssets = project.commissions.flatMap(
    (commission) => commission.deliverableAssets,
  );
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    isHidden: project.isHidden,
    coverAssetUrl: deliverableAssets[0] ?? null,
    commissionCount: project.commissions.length,
    deliverableAssets,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
