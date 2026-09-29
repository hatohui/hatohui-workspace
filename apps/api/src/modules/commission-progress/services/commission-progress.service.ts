import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { AssetsService } from '@/modules/assets/services/assets.service';
import { CommissionAttachmentsService } from '@/modules/commission-attachments/services/commission-attachments.service';
import {
  CommissionStatus,
  Visibility,
  type Comment,
  type CommissionProgress,
} from '@prisma/client';
import {
  type CommentDto,
  toClientCommentDto,
  toCommentDto,
} from '@/modules/commissions/dto/comment.dto';
import {
  CommissionProgressDto,
  CreateCommissionProgressDto,
  UpdateCommissionProgressDto,
} from '@/modules/commission-progress/dto/commission-progress.dto';
import { SKETCH_APPROVED_BY_CLIENT_NOTE } from '@/modules/commission-progress/commission-progress.constants';

@Injectable()
export class CommissionProgressService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly assets: AssetsService,
    private readonly attachments: CommissionAttachmentsService,
  ) {}

  /// Full timeline for the owning artist — includes INTERNAL entries.
  async listForArtist(
    artistId: string,
    commissionId: string,
  ): Promise<CommissionProgressDto[]> {
    await this.assertCommissionOwned(artistId, commissionId);
    const rows = await this.db.commissionProgress.findMany({
      where: { commissionId },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => toDto(row));
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
      include: {
        comments: {
          where: { visibility: Visibility.CLIENT },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => toDto(row, toClientCommentDto));
  }

  async approveByAccessCode(
    code: string,
    id: string,
  ): Promise<CommissionProgressDto> {
    const row = await this.db.commissionProgress.findFirst({
      where: {
        id,
        requestsApproval: true,
        visibility: Visibility.CLIENT,
        commission: { accessCode: code },
      },
      include: { commission: true },
    });
    if (!row) throw new NotFoundException(`Progress entry ${id} not found`);
    if (row.approvedAt) return this.findForClient(id);

    const { commission } = row;
    const confirms = commission.status === CommissionStatus.SKETCH;
    await this.db.$transaction([
      this.db.commissionProgress.update({
        where: { id },
        data: { approvedAt: new Date() },
      }),
      ...(confirms
        ? [
            this.db.commission.update({
              where: { id: commission.id },
              data: { status: CommissionStatus.CONFIRMED },
            }),
            this.db.commissionStatusHistory.create({
              data: {
                commissionId: commission.id,
                fromStatus: commission.status,
                toStatus: CommissionStatus.CONFIRMED,
                changedById: commission.artistId,
                note: SKETCH_APPROVED_BY_CLIENT_NOTE,
              },
            }),
          ]
        : []),
    ]);
    return this.findForClient(id);
  }

  private async findForClient(id: string): Promise<CommissionProgressDto> {
    const row = await this.db.commissionProgress.findUniqueOrThrow({
      where: { id },
      include: {
        comments: {
          where: { visibility: Visibility.CLIENT },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return toDto(row, toClientCommentDto);
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
        description: dto.description?.trim() || null,
        body: dto.body ?? undefined,
        images,
        isFinal: dto.isFinal ?? false,
        requestsApproval:
          (dto.requestsApproval ?? false) &&
          dto.visibility === Visibility.CLIENT,
        visibility: dto.visibility,
        projectId: dto.isFinal ? (dto.projectId ?? null) : null,
      },
    });
    await this.attachments.claim(dto.images, dto.description);
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
        description: dto.description?.trim(),
        body: dto.body ?? undefined,
        images,
        visibility: dto.visibility ?? undefined,
        projectId: existing.isFinal ? (dto.projectId ?? undefined) : undefined,
      },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    await this.attachments.claim(dto.images ?? [], dto.description);
    return toDto(row);
  }

  async finalize(
    artistId: string,
    id: string,
    projectId?: string,
  ): Promise<CommissionProgressDto> {
    const existing = await this.assertOwned(artistId, id);
    if (projectId) await this.assertProjectOwned(artistId, projectId);
    const row = await this.db.commissionProgress.update({
      where: { id },
      data: { isFinal: true, projectId: projectId ?? null },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    await this.db.commissionDetail.update({
      where: { commissionId: existing.commissionId },
      data: { deliveredAt: new Date() },
    });
    if (projectId)
      await this.linkImagesToProject(artistId, projectId, row.images);
    return toDto(row);
  }

  async remove(artistId: string, id: string): Promise<void> {
    await this.assertOwned(artistId, id);
    const row = await this.db.commissionProgress.delete({
      where: { id },
      include: { comments: true },
    });
    await this.attachments.release(
      [...row.images, ...row.comments.flatMap((comment) => comment.images)],
      [row.description, ...row.comments.map((comment) => comment.body)],
    );
  }

  private async linkImagesToProject(
    artistId: string,
    projectId: string,
    images: string[],
  ): Promise<void> {
    if (images.length === 0) return;
    const artist = await this.db.user.findUniqueOrThrow({
      where: { id: artistId },
    });
    const assetIds: string[] = [];
    for (const url of images) {
      assetIds.push(await this.assets.ensureForUrl(url, artist));
    }
    const last = await this.db.projectAsset.aggregate({
      where: { projectId },
      _max: { position: true },
    });
    const start = (last._max.position ?? -1) + 1;
    await this.db.projectAsset.createMany({
      data: assetIds.map((assetId, index) => ({
        projectId,
        assetId,
        position: start + index,
      })),
      skipDuplicates: true,
    });
  }

  private async assertProjectOwned(
    artistId: string,
    projectId: string,
  ): Promise<void> {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
      select: { artistId: true },
    });
    if (!project || project.artistId !== artistId) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
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

function toDto(
  row: CommissionProgress & { comments?: Comment[] },
  toComment: (comment: Comment) => CommentDto = toCommentDto,
): CommissionProgressDto {
  return {
    id: row.id,
    commissionId: row.commissionId,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    body: row.body as object | null,
    images: row.images,
    isFinal: row.isFinal,
    requestsApproval: row.requestsApproval,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    seenByClientAt: row.seenByClientAt?.toISOString() ?? null,
    comments: (row.comments ?? []).map(toComment),
  };
}
