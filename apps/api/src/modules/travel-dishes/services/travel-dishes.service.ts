import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  STAGING_PREFIX,
  isStagedKey,
  travelDishImageKeyFor,
} from '@/common/utils/asset-paths';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { TravelDishThumbnailExecutor } from '@/modules/travel-dishes/services/travel-dish-thumbnail.executor';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import { TravelCuisinesService } from '@/modules/travel-cuisines/services/travel-cuisines.service';
import { travelCuisineNamesSelect } from '@/modules/travel-recommendations/utils/travel-recommendation.mapper';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { travelAreaFilter } from '@/modules/travel-recommendations/utils/travel-place-area';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';
import {
  toTravelCreatorDto,
  travelCreatorFilter,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import {
  CreateTravelDishDto,
  TravelDishDetailDto,
  TravelDishDto,
  TravelDishQueryDto,
  UpdateTravelDishDto,
} from '@/modules/travel-dishes/dto/travel-dish.dto';

const dishInclude = {
  cuisines: travelCuisineNamesSelect,
  createdBy: { select: travelCreatorSelect },
  _count: { select: { recommendations: true } },
} satisfies Prisma.TravelDishInclude;

type DishRow = Prisma.TravelDishGetPayload<{ include: typeof dishInclude }>;

@Injectable()
export class TravelDishesService {
  private readonly logger = new Logger(TravelDishesService.name);

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly recommendations: TravelRecommendationsService,
    private readonly cuisines: TravelCuisinesService,
    private readonly processQueue: ProcessQueueService,
    private readonly thumbnailExecutor: TravelDishThumbnailExecutor,
  ) {}

  async list(query: TravelDishQueryDto): Promise<TravelDishDto[]> {
    const q = query.q?.trim();
    const contains = q ? { contains: q, mode: 'insensitive' as const } : null;
    const inArea = travelAreaFilter(query);
    const and: Prisma.TravelDishWhereInput[] = [];

    if (query.cuisines?.length) {
      and.push({
        cuisines: {
          some: {
            OR: query.cuisines.map((name) => ({
              name: { equals: name, mode: 'insensitive' as const },
            })),
          },
        },
      });
    }

    const requiredTags = [...(query.diets ?? []), ...(query.tags ?? [])];
    const recMatch: Prisma.TravelRecommendationWhereInput = {
      ...(inArea ? { place: inArea } : {}),
      ...(query.spicy ? { spicy: true } : {}),
      ...(requiredTags.length
        ? { AND: requiredTags.map((key) => ({ tags: { some: { key } } })) }
        : {}),
    };
    if (Object.keys(recMatch).length > 0) {
      and.push({ recommendations: { some: recMatch } });
    }
    if (query.excludeAllergens?.length) {
      and.push({
        recommendations: {
          none: { tags: { some: { key: { in: query.excludeAllergens } } } },
        },
      });
    }

    const rows = await this.db.travelDish.findMany({
      where: {
        createdBy: travelCreatorFilter(query.by),
        AND: and.length ? and : undefined,
        OR: contains
          ? [{ name: contains }, { cuisines: { some: { name: contains } } }]
          : undefined,
      },
      include: dishInclude,
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async get(id: string): Promise<TravelDishDetailDto> {
    const row = await this.db.travelDish.findUnique({
      where: { id },
      include: dishInclude,
    });
    if (!row) throw new NotFoundException('Dish not found');
    const recommendations = await this.recommendations.list({ dishId: id });
    return { ...this.toDto(row), recommendations };
  }

  async create(
    dto: CreateTravelDishDto,
    userId: string,
  ): Promise<TravelDishDetailDto> {
    const cuisines = await this.cuisineRefs(dto.cuisines, userId);
    const created = await this.guardUnique(() =>
      this.db.travelDish.create({
        data: {
          ...this.fieldsOf(dto),
          cuisines: { connect: cuisines },
          createdById: userId,
        },
      }),
    );
    if (dto.imageKey) {
      const imageKey = await this.placeImage(
        created.id,
        dto.imageKey,
        null,
        userId,
      );
      await this.db.travelDish.update({
        where: { id: created.id },
        data: { imageKey },
      });
      if (imageKey) await this.generateOrQueueThumbnail(created.id);
    }
    return this.get(created.id);
  }

  async bulkCreate(
    names: string[],
    userId: string,
  ): Promise<TravelBulkResultDto> {
    const wanted = uniqueNames(names);
    const existing = await this.db.travelDish.findMany({
      where: {
        OR: wanted.map((name) => ({
          name: { equals: name, mode: 'insensitive' as const },
        })),
      },
      select: { name: true },
    });
    const taken = new Set(existing.map((row) => row.name.toLowerCase()));
    const fresh = wanted.filter((name) => !taken.has(name.toLowerCase()));
    await this.db.travelDish.createMany({
      data: fresh.map((name) => ({ name, createdById: userId })),
      skipDuplicates: true,
    });
    return { created: fresh.length, skipped: names.length - fresh.length };
  }

  async update(
    id: string,
    dto: UpdateTravelDishDto,
    userId: string,
  ): Promise<TravelDishDetailDto> {
    const existing = await this.db.travelDish.findUnique({
      where: { id },
      select: { imageKey: true, thumbnailKey: true, previewKey: true },
    });
    if (!existing) throw new NotFoundException('Dish not found');
    const cuisines =
      dto.cuisines && (await this.cuisineRefs(dto.cuisines, userId));
    const imageKey =
      dto.imageKey === undefined
        ? undefined
        : await this.placeImage(id, dto.imageKey, existing.imageKey, userId);
    const imageChanged =
      imageKey !== undefined && imageKey !== existing.imageKey;
    await this.guardUnique(() =>
      this.db.travelDish.update({
        where: { id },
        data: {
          ...this.fieldsOf(dto),
          ...(imageChanged
            ? { imageKey, thumbnailKey: null, previewKey: null }
            : {}),
          cuisines: cuisines ? { set: cuisines } : undefined,
        },
      }),
    );
    if (imageChanged) {
      const oldKeys = [
        existing.imageKey,
        existing.thumbnailKey,
        existing.previewKey,
      ].filter((k): k is string => Boolean(k));
      if (oldKeys.length) await this.recommendations.deleteObjects(oldKeys);
      if (imageKey) await this.generateOrQueueThumbnail(id);
    }
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.db.travelDish.findUnique({
      where: { id },
      select: { imageKey: true, thumbnailKey: true, previewKey: true },
    });
    if (!existing) throw new NotFoundException('Dish not found');
    const keys = await this.recommendations.imageKeysWhere({ dishId: id });
    for (const key of [
      existing.imageKey,
      existing.thumbnailKey,
      existing.previewKey,
    ]) {
      if (key) keys.push(key);
    }
    await this.db.travelDish.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Dish not found');
    });
    await this.recommendations.deleteObjects(keys);
  }

  private async generateOrQueueThumbnail(dishId: string): Promise<void> {
    try {
      await this.thumbnailExecutor.execute(dishId);
    } catch (error) {
      this.logger.warn(
        `Travel dish thumbnail failed for ${dishId}, queued: ${error}`,
      );
      await this.processQueue.enqueueFailure(
        ProcessType.TRAVEL_DISH_THUMBNAIL,
        dishId,
        error,
      );
    }
  }

  private async placeImage(
    dishId: string,
    key: string | null,
    existingKey: string | null,
    uploaderId: string,
  ): Promise<string | null> {
    const trimmed = key?.trim() ?? '';
    if (!trimmed) return null;
    if (trimmed === existingKey) return existingKey;
    if (!isStagedKey(trimmed)) {
      throw new BadRequestException(`Unknown image key: ${trimmed}`);
    }
    if (!trimmed.startsWith(`${STAGING_PREFIX}/${uploaderId}/`)) {
      throw new BadRequestException("Cannot claim another uploader's file");
    }
    const target = travelDishImageKeyFor(dishId, trimmed);
    await this.storage.moveObject(trimmed, target);
    return target;
  }

  private async cuisineRefs(names: string[] | undefined, userId: string) {
    const ids = await this.cuisines.resolveIds(names ?? [], userId);
    return ids.map((id) => ({ id }));
  }

  private fieldsOf(dto: UpdateTravelDishDto) {
    return {
      name: dto.name?.trim(),
      description:
        dto.description === undefined
          ? undefined
          : dto.description.trim() || null,
    } as { name: string; description?: string | null };
  }

  private toDto(row: DishRow): TravelDishDto {
    const imageUrl = row.imageKey
      ? this.storage.getPublicUrl(row.imageKey)
      : null;
    const thumbnailUrl = row.thumbnailKey
      ? this.storage.getPublicUrl(row.thumbnailKey)
      : imageUrl;
    const previewUrl = row.previewKey
      ? this.storage.getPublicUrl(row.previewKey)
      : imageUrl;
    return {
      id: row.id,
      name: row.name,
      cuisines: row.cuisines.map((cuisine) => cuisine.name),
      description: row.description,
      placeCount: row._count.recommendations,
      imageKey: row.imageKey,
      imageUrl,
      thumbnailUrl,
      previewUrl,
      coverImageUrl: thumbnailUrl,
      createdBy: toTravelCreatorDto(row.createdBy),
      createdAt: row.createdAt,
    };
  }

  private async guardUnique<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION_CODE
      ) {
        throw new ConflictException('A dish with that name already exists');
      }
      throw error;
    }
  }
}
