import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { Visibility, type CommissionProgress } from '@prisma/client';
import {
  CommissionProgressDto,
  CreateCommissionProgressDto,
  UpdateCommissionProgressDto,
} from '@/modules/commission-progress/dto/commission-progress.dto';

@Injectable()
export class CommissionProgressService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
  ) {}

  /// Full timeline for the owning artist — includes INTERNAL entries.
  async listForArtist(
    artistId: string,
    commissionId: string,
  ): Promise<CommissionProgressDto[]> {
    await this.assertCommissionOwned(artistId, commissionId);
    const rows = await this.db.commissionProgress.findMany({
      where: { commissionId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toDto);
  }

  /// The client-facing timeline, reached via access code — CLIENT-visible
  /// entries only, same rule as Comment's public filtering elsewhere.
  async listByAccessCode(code: string): Promise<CommissionProgressDto[]> {
    const commission = await this.db.commission.findUnique({
      where: { accessCode: code },
      select: { id: true },
    });
    if (!commission) {
      throw new NotFoundException(`Commission ${code} not found`);
    }
    const rows = await this.db.commissionProgress.findMany({
      where: { commissionId: commission.id, visibility: Visibility.CLIENT },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toDto);
  }

  async create(
    artistId: string,
    dto: CreateCommissionProgressDto,
  ): Promise<CommissionProgressDto> {
    await this.assertCommissionOwned(artistId, dto.commissionId);
    const images = dto.images.map((key) => this.storage.getPublicUrl(key));
    const row = await this.db.commissionProgress.create({
      data: {
        commissionId: dto.commissionId,
        title: dto.title ?? null,
        body: dto.body ?? undefined,
        images,
        isFinal: dto.isFinal ?? false,
        visibility: dto.visibility,
        projectId: dto.isFinal ? (dto.projectId ?? null) : null,
      },
    });
    if (dto.isFinal) {
      await this.db.commissionDetail.update({
        where: { commissionId: dto.commissionId },
        data: { deliveredAt: new Date() },
      });
    }
    return toDto(row);
  }

  async update(
    artistId: string,
    id: string,
    dto: UpdateCommissionProgressDto,
  ): Promise<CommissionProgressDto> {
    const existing = await this.assertOwned(artistId, id);
    const images = dto.images?.map((key) => this.storage.getPublicUrl(key));
    const row = await this.db.commissionProgress.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        body: dto.body ?? undefined,
        images,
        visibility: dto.visibility ?? undefined,
        projectId: existing.isFinal ? (dto.projectId ?? undefined) : undefined,
      },
    });
    return toDto(row);
  }

  async finalize(
    artistId: string,
    id: string,
    projectId?: string,
  ): Promise<CommissionProgressDto> {
    const existing = await this.assertOwned(artistId, id);
    const row = await this.db.commissionProgress.update({
      where: { id },
      data: { isFinal: true, projectId: projectId ?? null },
    });
    await this.db.commissionDetail.update({
      where: { commissionId: existing.commissionId },
      data: { deliveredAt: new Date() },
    });
    return toDto(row);
  }

  async remove(artistId: string, id: string): Promise<void> {
    await this.assertOwned(artistId, id);
    await this.db.commissionProgress.delete({ where: { id } });
  }

  private async assertCommissionOwned(
    artistId: string,
    commissionId: string,
  ): Promise<void> {
    const commission = await this.db.commission.findUnique({
      where: { id: commissionId },
      select: { artistId: true },
    });
    if (!commission) {
      throw new NotFoundException(`Commission ${commissionId} not found`);
    }
    if (commission.artistId !== artistId) {
      throw new ForbiddenException('Not your commission');
    }
  }

  private async assertOwned(
    artistId: string,
    id: string,
  ): Promise<CommissionProgress> {
    const row = await this.db.commissionProgress.findUnique({
      where: { id },
      include: { commission: { select: { artistId: true } } },
    });
    if (!row || row.commission.artistId !== artistId) {
      throw new NotFoundException(`Progress entry ${id} not found`);
    }
    return row;
  }
}

function toDto(row: CommissionProgress): CommissionProgressDto {
  return {
    id: row.id,
    commissionId: row.commissionId,
    projectId: row.projectId,
    title: row.title,
    body: row.body as object | null,
    images: row.images,
    isFinal: row.isFinal,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
