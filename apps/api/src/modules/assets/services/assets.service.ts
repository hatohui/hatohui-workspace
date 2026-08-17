import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import type { Prisma, Asset, User } from '@prisma/client';
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
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
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
                { tags: { has: query } },
              ],
            }
          : {},
        tag ? { tags: { has: tag } } : {},
      ],
    };

    const [items, total] = await Promise.all([
      this.db.asset.findMany({
        where,
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
    const asset = await this.db.asset.create({
      data: {
        key: dto.key,
        publicUrl: this.storage.getPublicUrl(dto.key),
        filename: dto.filename,
        contentType: dto.contentType,
        size: dto.size,
        width: dto.width ?? null,
        height: dto.height ?? null,
        tags: dto.tags ?? [],
        uploadedById: uploader.id,
      },
    });
    return toAssetDto(asset);
  }

  async update(id: string, dto: UpdateAssetDto): Promise<AssetDto> {
    await this.findOrThrow(id);
    const asset = await this.db.asset.update({
      where: { id },
      data: { tags: dto.tags },
    });
    return toAssetDto(asset);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOrThrow(id);
    await this.db.asset.delete({ where: { id } });
    await this.storage.deleteObject(existing.key).catch(() => {});
  }

  private async findOrThrow(id: string): Promise<Asset> {
    const asset = await this.db.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return asset;
  }
}

function toAssetDto(asset: Asset): AssetDto {
  return {
    id: asset.id,
    key: asset.key,
    publicUrl: asset.publicUrl,
    filename: asset.filename,
    contentType: asset.contentType,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    tags: asset.tags,
    uploadedById: asset.uploadedById,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  };
}
