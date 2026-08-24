import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { ProcessType } from '@/modules/process-queue/process-queue.constants';
import { AssetThumbnailExecutor } from '@/modules/assets/services/asset-thumbnail-executor.service';
import type { Prisma, Asset, Tag, User } from '@prisma/client';
import type { AssetSortOption } from '@/modules/assets/assets.constants';
import { PaginatedAssetsDto } from '@/modules/assets/dto/asset-query.dto';
import {
  AssetDto,
  CreateAssetDto,
  UpdateAssetDto,
} from '@/modules/assets/dto/asset.dto';

const SORT_ORDER_BY: Record<
  AssetSortOption,
  Prisma.AssetOrderByWithRelationInput
> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  size: { size: 'desc' },
  alphabetical: { filename: 'asc' },
};

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly auth: AuthService,
    private readonly processQueue: ProcessQueueService,
    private readonly thumbnailExecutor: AssetThumbnailExecutor,
  ) {}

  async list(
    query: string | undefined,
    tag: string | undefined,
    sort: AssetSortOption,
    page: number,
    pageSize: number,
  ): Promise<PaginatedAssetsDto> {
    const where: Prisma.AssetWhereInput = {
      AND: [
        query
          ? {
              OR: [
                { filename: { contains: query, mode: 'insensitive' } },
                {
                  tags: {
                    some: { name: { contains: query, mode: 'insensitive' } },
                  },
                },
              ],
            }
          : {},
        tag ? { tags: { some: { name: tag } } } : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.db.asset.findMany({
        where,
        include: { tags: true },
        orderBy: SORT_ORDER_BY[sort],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.asset.count({ where }),
    ]);

    return {
      items: items.map(toAssetDto),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async create(dto: CreateAssetDto, uploader: User): Promise<AssetDto> {
    await this.assertAdmin(uploader);

    if (Boolean(dto.key) === Boolean(dto.externalUrl)) {
      throw new BadRequestException(
        'Provide exactly one of key or externalUrl',
      );
    }

    const source = dto.key ? 'UPLOAD' : 'EXTERNAL_URL';
    const publicUrl = dto.key
      ? this.storage.getPublicUrl(dto.key)
      : (dto.externalUrl as string);

    const tagIds = await this.resolveTagIds(dto.tags ?? []);
    const created = await this.db.asset.create({
      data: {
        source,
        key: dto.key ?? null,
        publicUrl,
        filename: dto.filename ?? fallbackFilename(publicUrl),
        contentType: dto.contentType ?? 'application/octet-stream',
        size: dto.size ?? 0,
        width: dto.width ?? null,
        height: dto.height ?? null,
        tags: { connect: tagIds.map((id) => ({ id })) },
        uploadedById: uploader.id,
        thumbnailStatus: 'PENDING',
      },
    });

    try {
      await this.thumbnailExecutor.execute(created.id);
    } catch (err) {
      this.logger.warn(`Thumbnail generation failed for ${created.id}: ${err}`);
      await this.processQueue.enqueueFailure(
        ProcessType.ASSET_THUMBNAIL,
        created.id,
        err,
      );
      await this.db.asset.update({
        where: { id: created.id },
        data: { thumbnailStatus: 'FAILED' },
      });
    }

    const asset = await this.db.asset.findUniqueOrThrow({
      where: { id: created.id },
      include: { tags: true },
    });
    return toAssetDto(asset);
  }

  async update(
    id: string,
    dto: UpdateAssetDto,
    actor: User,
  ): Promise<AssetDto> {
    await this.assertAdmin(actor);
    await this.findOrThrow(id);
    const tagIds = await this.resolveTagIds(dto.tags);
    const asset = await this.db.asset.update({
      where: { id },
      data: { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } },
      include: { tags: true },
    });
    return toAssetDto(asset);
  }

  private async resolveTagIds(names: string[]): Promise<string[]> {
    const tags = await Promise.all(
      names.map((name) =>
        this.db.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        }),
      ),
    );
    return tags.map((tag) => tag.id);
  }

  async remove(id: string, actor: User): Promise<void> {
    await this.assertAdmin(actor);
    const existing = await this.findOrThrow(id);
    await this.db.asset.delete({ where: { id } });
    if (existing.key) {
      await this.storage.deleteObject(existing.key).catch(() => {});
    }
    if (existing.thumbnailKey) {
      await this.storage.deleteObject(existing.thumbnailKey).catch(() => {});
    }
    await this.processQueue.clearForRef(ProcessType.ASSET_THUMBNAIL, id);
  }

  private async assertAdmin(user: User): Promise<void> {
    if (!(await this.auth.isAdmin(user))) {
      throw new ForbiddenException('Admin access denied');
    }
  }

  private async findOrThrow(id: string): Promise<Asset> {
    const asset = await this.db.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return asset;
  }
}

function fallbackFilename(publicUrl: string): string {
  return publicUrl.split('/').pop() || publicUrl;
}

function toAssetDto(asset: Asset & { tags: Tag[] }): AssetDto {
  return {
    id: asset.id,
    source: asset.source,
    key: asset.key,
    publicUrl: asset.publicUrl,
    thumbnailUrl: asset.thumbnailUrl,
    thumbnailStatus: asset.thumbnailStatus,
    filename: asset.filename,
    contentType: asset.contentType,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    tags: asset.tags.map((tag) => tag.name),
    uploadedById: asset.uploadedById,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}
