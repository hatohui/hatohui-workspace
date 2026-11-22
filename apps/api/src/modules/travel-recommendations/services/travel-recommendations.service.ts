import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type TravelTagKind } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { tagKeyOf } from '@/modules/travel-tags/utils/tag-key';
import { travelPlaceData } from '@/modules/travel-recommendations/utils/travel-place-data';
import {
  CreateTravelRecommendationDto,
  UpdateTravelRecommendationDto,
} from '@/modules/travel-recommendations/dto/travel-recommendation-input.dto';
import type { TravelRecommendationQueryDto } from '@/modules/travel-recommendations/dto/travel-recommendation-query.dto';
import { TravelRecommendationDto } from '@/modules/travel-recommendations/dto/travel-recommendation.dto';
import {
  TRAVEL_CATALOG_LIMIT,
  UNIQUE_VIOLATION_CODE,
} from '@/modules/travel-recommendations/travel-recommendations.constants';
import { TravelRecommendationImagesService } from '@/modules/travel-recommendations/services/travel-recommendation-images.service';
import { TravelCuisinesService } from '@/modules/travel-cuisines/services/travel-cuisines.service';
import { travelRecommendationWhere } from '@/modules/travel-recommendations/utils/travel-recommendation-filters';
import {
  travelRecommendationDetails,
  travelTagKeys,
} from '@/modules/travel-recommendations/utils/travel-recommendation-details';
import {
  type TravelRecommendationRow,
  toTravelRecommendationDto,
  travelRecommendationInclude,
} from '@/modules/travel-recommendations/utils/travel-recommendation.mapper';

@Injectable()
export class TravelRecommendationsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly images: TravelRecommendationImagesService,
    private readonly cuisines: TravelCuisinesService,
  ) {}

  async list(
    query: TravelRecommendationQueryDto,
  ): Promise<TravelRecommendationDto[]> {
    const rows = await this.db.travelRecommendation.findMany({
      where: travelRecommendationWhere(query),
      include: travelRecommendationInclude,
      orderBy: { createdAt: 'desc' },
      take: TRAVEL_CATALOG_LIMIT,
    });
    return rows.map((row) => this.toDto(row));
  }

  async get(id: string): Promise<TravelRecommendationDto> {
    const row = await this.db.travelRecommendation.findUnique({
      where: { id },
      include: travelRecommendationInclude,
    });
    if (!row) throw new NotFoundException('Recommendation not found');
    return this.toDto(row);
  }

  async create(
    dto: CreateTravelRecommendationDto,
    userId: string,
  ): Promise<TravelRecommendationDto> {
    const resolvedTags = await this.resolveTagLists(dto);
    const dishId = await this.resolveDish(dto, userId);
    const placeId = await this.resolvePlace(dto, userId);

    const created = await this.guardUnique(() =>
      this.db.travelRecommendation.create({
        data: {
          dishId,
          placeId,
          ...travelRecommendationDetails(dto),
          tags: { connect: this.tagRefs(travelTagKeys(resolvedTags, [])) },
          createdById: userId,
        },
      }),
    );
    if (dto.imageKeys?.length) {
      await this.images.replace(created.id, dto.imageKeys, userId);
    }
    return this.get(created.id);
  }

  async update(
    id: string,
    dto: UpdateTravelRecommendationDto,
    userId: string,
  ): Promise<TravelRecommendationDto> {
    const resolvedTags = await this.resolveTagLists(dto);
    const current = await this.get(id);
    const tagKeys = travelTagKeys(resolvedTags, [
      ...current.allergens.map((key) => ({ key, kind: 'ALLERGEN' as const })),
      ...current.tags.map((key) => ({ key, kind: 'GENERAL' as const })),
    ]);
    await this.guardUnique(() =>
      this.db.travelRecommendation.update({
        where: { id },
        data: {
          dishId: dto.dishId,
          placeId: dto.placeId,
          ...travelRecommendationDetails(dto),
          tags: tagKeys ? { set: this.tagRefs(tagKeys) } : undefined,
        },
      }),
    );
    if (dto.placeAreaId !== undefined) {
      await this.db.travelPlace.update({
        where: { id: dto.placeId ?? current.place.id },
        data: { areaId: dto.placeAreaId.trim() || null },
      });
    }
    if (dto.imageKeys) await this.images.replace(id, dto.imageKeys, userId);
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const images = await this.images.imagesOf(id);
    await this.db.travelRecommendation.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Recommendation not found');
    });
    await this.images.deleteObjects(images.map((image) => image.key));
  }

  async imageKeysWhere(
    where: Prisma.TravelRecommendationWhereInput,
  ): Promise<string[]> {
    const rows = await this.db.travelRecommendationImage.findMany({
      where: { recommendation: where },
      select: { key: true, thumbnailKey: true, previewKey: true },
    });
    return rows.flatMap((row) =>
      [row.key, row.thumbnailKey, row.previewKey].filter((k): k is string =>
        Boolean(k),
      ),
    );
  }

  deleteObjects(keys: string[]): Promise<void> {
    return this.images.deleteObjects(keys);
  }

  private toDto(row: TravelRecommendationRow): TravelRecommendationDto {
    return toTravelRecommendationDto(row, (key) =>
      this.storage.getPublicUrl(key),
    );
  }

  private async resolveTagLists(dto: UpdateTravelRecommendationDto) {
    const allergens =
      dto.allergens === undefined
        ? undefined
        : await this.resolveTagsOfKind('ALLERGEN', dto.allergens);
    const tags =
      dto.tags === undefined
        ? undefined
        : await this.resolveTagsOfKind('GENERAL', dto.tags);
    return { allergens, tags };
  }

  private async resolveTagsOfKind(
    kind: TravelTagKind,
    entries: string[],
  ): Promise<string[]> {
    const cleaned = [
      ...new Set(entries.map((item) => item.trim()).filter(Boolean)),
    ];
    if (!cleaned.length) return [];

    const existing = await this.db.travelTag.findMany({
      select: { key: true, name: true, position: true },
    });
    const byKey = new Map(
      existing.map((tag) => [tag.key.toLowerCase(), tag.key]),
    );
    const byName = new Map(
      existing
        .filter((tag) => tag.name)
        .map((tag) => [tag.name!.toLowerCase(), tag.key]),
    );
    let nextPosition = existing.reduce(
      (max, tag) => Math.max(max, tag.position),
      0,
    );

    const keys: string[] = [];
    for (const entry of cleaned) {
      const slug = tagKeyOf(entry);
      const existingKey =
        byKey.get(entry.toLowerCase()) ??
        byName.get(entry.toLowerCase()) ??
        (slug ? byKey.get(slug) : undefined);
      if (existingKey) {
        keys.push(existingKey);
        continue;
      }
      if (!slug) continue;
      await this.db.travelTag.create({
        data: {
          key: slug,
          name: entry,
          kind,
          position: (nextPosition += 1),
        },
      });
      byKey.set(slug, slug);
      byName.set(entry.toLowerCase(), slug);
      keys.push(slug);
    }
    return [...new Set(keys)];
  }

  private tagRefs(keys: string[] | undefined) {
    return (keys ?? []).map((key) => ({ key }));
  }

  private async resolveDish(
    dto: CreateTravelRecommendationDto,
    userId: string,
  ): Promise<string> {
    if (dto.dishId) {
      const dish = await this.db.travelDish.findUnique({
        where: { id: dto.dishId },
      });
      if (!dish) throw new NotFoundException('Dish not found');
      return dish.id;
    }
    const name = dto.dishName?.trim();
    if (!name) throw new BadRequestException('Provide dishId or dishName');

    const existing = await this.db.travelDish.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) return existing.id;

    const cuisineIds = await this.cuisines.resolveIds(
      dto.cuisines ?? [],
      userId,
    );
    const created = await this.db.travelDish.create({
      data: {
        name,
        createdById: userId,
        cuisines: { connect: cuisineIds.map((id) => ({ id })) },
      },
    });
    return created.id;
  }

  private async resolvePlace(
    dto: CreateTravelRecommendationDto,
    userId: string,
  ): Promise<string> {
    if (dto.placeId) {
      const place = await this.db.travelPlace.findUnique({
        where: { id: dto.placeId },
      });
      if (!place) throw new NotFoundException('Place not found');
      return place.id;
    }
    const name = dto.place?.name.trim();
    if (!dto.place || !name) {
      throw new BadRequestException('Provide placeId or place');
    }

    const created = await this.db.travelPlace.create({
      data: {
        ...(await travelPlaceData(dto.place)),
        name,
        createdById: userId,
      },
    });
    return created.id;
  }

  private async guardUnique<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION_CODE
      ) {
        throw new ConflictException(
          'This place already has a recommendation for that dish',
        );
      }
      throw error;
    }
  }
}
