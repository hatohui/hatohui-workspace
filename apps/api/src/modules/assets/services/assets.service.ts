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
import type { Prisma, Asset, AssetTag, Tag, User } from '@prisma/client';
import type { AssetSortOption } from '@/modules/assets/assets.constants';
import { PaginatedAssetsDto } from '@/modules/assets/dto/asset-query.dto';
import {
  AssetDto,
  CreateAssetDto,
  UpdateAssetDto,
} from '@/modules/assets/dto/asset.dto';
import { TagSuggestionDto } from '@/modules/assets/dto/tag-suggestion.dto';
import { BulkDeleteAssetsResultDto } from '@/modules/assets/dto/bulk-delete-assets.dto';
import { BulkTagAssetsResultDto } from '@/modules/assets/dto/bulk-tag-assets.dto';

const SORT_ORDER_BY: Record<
  AssetSortOption,
  Prisma.AssetOrderByWithRelationInput
> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  size: { size: 'desc' },
  alphabetical: { filename: 'asc' },
};

const assetInclude = {
  tags: { include: { tag: true } },
  projects: { select: { projectId: true } },
} satisfies Prisma.AssetInclude;

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
    uploadedById?: string,
  ): Promise<PaginatedAssetsDto> {
    const where: Prisma.AssetWhereInput = {
      AND: [
        query
          ? {
              OR: [
                { filename: { contains: query, mode: 'insensitive' } },
                {
                  tags: {
                    some: {
                      tag: { name: { contains: query, mode: 'insensitive' } },
                    },
                  },
                },
              ],
            }
          : {},
        tag ? { tags: { some: { tag: { name: tag } } } } : {},
        uploadedById ? { uploadedById } : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.db.asset.findMany({
        where,
        include: assetInclude,
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

  async get(id: string): Promise<AssetDto> {
    const asset = await this.db.asset.findUnique({
      where: { id },
      include: assetInclude,
    });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return toAssetDto(asset);
  }

  async galleryTags(uploadedById?: string): Promise<TagSuggestionDto[]> {
    const scope = uploadedById ? { asset: { uploadedById } } : {};
    const [usedTags, commissionTypes] = await Promise.all([
      this.db.tag.findMany({
        where: { assets: { some: scope } },
        select: {
          name: true,
          _count: { select: { assets: { where: scope } } },
        },
      }),
      this.db.commissionType.findMany({
        where: { active: true, tag: { isNot: null } },
        select: { label: true, tag: { select: { name: true } } },
      }),
    ]);
    const typeLabelByTag = new Map(
      commissionTypes.map((type) => [type.tag?.name, type.label]),
    );

    return usedTags
      .map((tag) => ({
        name: tag.name,
        usageCount: tag._count.assets,
        commissionTypeLabel: typeLabelByTag.get(tag.name) ?? null,
      }))
      .sort(
        (a, b) =>
          Number(b.commissionTypeLabel !== null) -
            Number(a.commissionTypeLabel !== null) ||
          b.usageCount - a.usageCount ||
          a.name.localeCompare(b.name),
      );
  }

  async tagSuggestions(userId: string): Promise<TagSuggestionDto[]> {
    const ownAssets = { asset: { uploadedById: userId } };
    const [usedTags, commissionTypes] = await Promise.all([
      this.db.tag.findMany({
        where: { assets: { some: ownAssets } },
        select: {
          name: true,
          _count: { select: { assets: { where: ownAssets } } },
        },
      }),
      this.db.commissionType.findMany({
        where: {
          active: true,
          tag: { isNot: null },
          artistTypes: { some: { artistId: userId, active: true } },
        },
        select: { label: true, tag: { select: { name: true } } },
      }),
    ]);

    const byName = new Map<string, TagSuggestionDto>();
    for (const tag of usedTags) {
      byName.set(tag.name, {
        name: tag.name,
        usageCount: tag._count.assets,
        commissionTypeLabel: null,
      });
    }
    for (const type of commissionTypes) {
      if (!type.tag) continue;
      const existing = byName.get(type.tag.name);
      byName.set(type.tag.name, {
        name: type.tag.name,
        usageCount: existing?.usageCount ?? 0,
        commissionTypeLabel: type.label,
      });
    }

    return [...byName.values()].sort(
      (a, b) =>
        Number(b.commissionTypeLabel !== null) -
          Number(a.commissionTypeLabel !== null) ||
        b.usageCount - a.usageCount ||
        a.name.localeCompare(b.name),
    );
  }

  async ensureForUrl(url: string, uploader: User): Promise<string> {
    const existing = await this.db.asset.findFirst({
      where: { publicUrl: url },
      select: { id: true },
    });
    if (existing) return existing.id;

    const key = this.storage.getKeyFromUrl(url);
    const created = await this.create(
      key ? { key } : { externalUrl: url },
      uploader,
    );
    return created.id;
  }

  async create(dto: CreateAssetDto, uploader: User): Promise<AssetDto> {
    await this.assertArtistOrAdmin(uploader);

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
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
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
      include: assetInclude,
    });
    return toAssetDto(asset);
  }

  async update(
    id: string,
    dto: UpdateAssetDto,
    actor: User,
  ): Promise<AssetDto> {
    const existing = await this.findOrThrow(id);
    await this.assertOwnerOrAdmin(existing, actor);
    const tagIds = await this.resolveTagIds(dto.tags);
    // Explicit join rows don't support the implicit relation's `set` — clear
    // this asset's tags and recreate them, same net effect.
    const asset = await this.db.asset.update({
      where: { id },
      data: {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: assetInclude,
    });
    return toAssetDto(asset);
  }

  private async resolveTagIds(names: string[]): Promise<string[]> {
    const unique = [
      ...new Map(
        names
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLowerCase(), name]),
      ).values(),
    ];
    if (unique.length === 0) return [];

    const existing = await this.db.tag.findMany({
      where: {
        OR: unique.map((name) => ({
          name: { equals: name, mode: 'insensitive' as const },
        })),
      },
    });
    const idByName = new Map(
      existing.map((tag) => [tag.name.toLowerCase(), tag.id]),
    );
    const created = await Promise.all(
      unique
        .filter((name) => !idByName.has(name.toLowerCase()))
        .map((name) =>
          this.db.tag.upsert({ where: { name }, create: { name }, update: {} }),
        ),
    );
    created.forEach((tag) => idByName.set(tag.name.toLowerCase(), tag.id));
    return unique.map((name) => idByName.get(name.toLowerCase()) as string);
  }

  async addTagsToMany(
    ids: string[],
    tags: string[],
    actor: User,
  ): Promise<BulkTagAssetsResultDto> {
    const existing = await this.db.asset.findMany({
      where: { id: { in: ids } },
      select: { id: true, uploadedById: true },
    });
    if (existing.some((asset) => asset.uploadedById !== actor.id)) {
      await this.assertAdmin(actor);
    }
    const tagIds = await this.resolveTagIds(tags);
    await this.db.assetTag.createMany({
      data: existing.flatMap((asset) =>
        tagIds.map((tagId) => ({ assetId: asset.id, tagId })),
      ),
      skipDuplicates: true,
    });
    return { updatedIds: existing.map((asset) => asset.id) };
  }

  async remove(id: string, actor: User): Promise<void> {
    const existing = await this.findOrThrow(id);
    await this.assertOwnerOrAdmin(existing, actor);
    await this.db.asset.delete({ where: { id } });
    await this.cleanUpDeleted(existing);
  }

  async removeMany(
    ids: string[],
    actor: User,
  ): Promise<BulkDeleteAssetsResultDto> {
    const existing = await this.db.asset.findMany({
      where: { id: { in: ids } },
    });
    if (existing.some((asset) => asset.uploadedById !== actor.id)) {
      await this.assertAdmin(actor);
    }
    const deletedIds = existing.map((asset) => asset.id);
    await this.db.asset.deleteMany({ where: { id: { in: deletedIds } } });
    await Promise.all(existing.map((asset) => this.cleanUpDeleted(asset)));
    return { deletedIds };
  }

  private async cleanUpDeleted(asset: Asset): Promise<void> {
    if (asset.key) {
      await this.storage.deleteObject(asset.key).catch(() => {});
    }
    if (asset.thumbnailKey) {
      await this.storage.deleteObject(asset.thumbnailKey).catch(() => {});
    }
    await this.processQueue.clearForRef(ProcessType.ASSET_THUMBNAIL, asset.id);
  }

  private async assertAdmin(user: User): Promise<void> {
    if (!(await this.auth.isAdmin(user))) {
      throw new ForbiddenException('Admin access denied');
    }
  }

  /// Uploading is an artist managing their own gallery, not a site-admin
  /// power — gate on either role, same reasoning as assertOwnerOrAdmin below.
  private async assertArtistOrAdmin(user: User): Promise<void> {
    if (await this.auth.isArtist(user)) return;
    await this.assertAdmin(user);
  }

  /// Managing an asset is either a global-admin power, or the uploader
  /// managing their own — an artist doesn't need site-wide admin to edit
  /// tags on or delete their own gallery uploads.
  private async assertOwnerOrAdmin(asset: Asset, actor: User): Promise<void> {
    if (asset.uploadedById === actor.id) return;
    await this.assertAdmin(actor);
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

function toAssetDto(
  asset: Asset & {
    tags: (AssetTag & { tag: Tag })[];
    projects: { projectId: string }[];
  },
): AssetDto {
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
    tags: asset.tags.map((assetTag) => assetTag.tag.name),
    projectIds: asset.projects.map((link) => link.projectId),
    uploadedById: asset.uploadedById,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}
