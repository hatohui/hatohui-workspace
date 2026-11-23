import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type TravelTagKind } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { matchesSearch } from '@/common/utils/text-search';
import { tagKeyOf } from '@/modules/travel-tags/utils/tag-key';
import { travelPlaceData } from '@/modules/travel-recommendations/utils/travel-place-data';
import {
  CreateTravelRecommendationDto,
  TravelRecommendationDishInputDto,
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
import { TravelFoodCategoriesService } from '@/modules/travel-food-categories/services/travel-food-categories.service';
import { TravelPlaceCategoriesService } from '@/modules/travel-place-categories/services/travel-place-categories.service';
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
    private readonly foodCategories: TravelFoodCategoriesService,
    private readonly placeCategories: TravelPlaceCategoriesService,
  ) {}

  async list(
    query: TravelRecommendationQueryDto,
  ): Promise<TravelRecommendationDto[]> {
    const q = query.q?.trim() ?? '';
    const rows = await this.db.travelRecommendation.findMany({
      where: travelRecommendationWhere(query),
      include: travelRecommendationInclude,
      orderBy: { createdAt: 'desc' },
      ...(q ? {} : { take: TRAVEL_CATALOG_LIMIT }),
    });
    const matched = q
      ? rows
          .filter((row) =>
            matchesSearch(q, [
              row.note,
              ...row.dishes.flatMap((line) => [
                line.dish.name,
                ...line.dish.cuisines.map((c) => c.name),
                ...line.dish.categories.map((c) => c.name),
              ]),
              row.place.name,
              ...row.place.categories.map((c) => c.name),
              row.place.address,
              row.place.area?.name,
            ]),
          )
          .slice(0, TRAVEL_CATALOG_LIMIT)
      : rows;
    return matched.map((row) => this.toDto(row));
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
    const placeId = await this.resolvePlace(dto, userId);
    const lines = await this.resolveDishLines(dto.dishes, userId);

    const created = await this.guardUnique(() =>
      this.db.travelRecommendation.create({
        data: {
          placeId,
          ...travelRecommendationDetails(dto),
          tags: { connect: this.tagRefs(travelTagKeys(resolvedTags, [])) },
          createdById: userId,
          dishes: {
            create: lines.map((line, position) => ({
              ...line,
              allergens: { connect: this.tagRefs(line.allergens) },
              placeId,
              position,
            })),
          },
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
    const placeId = dto.placeId ?? current.place.id;
    const tagKeys = travelTagKeys(resolvedTags, [
      ...current.specials.map((key) => ({ key, kind: 'SPECIAL' as const })),
      ...current.tags.map((key) => ({ key, kind: 'GENERAL' as const })),
    ]);
    const lines = dto.dishes
      ? await this.resolveDishLines(dto.dishes, userId)
      : undefined;

    await this.guardUnique(() =>
      this.db.$transaction(async (tx) => {
        await tx.travelRecommendation.update({
          where: { id },
          data: {
            placeId,
            ...travelRecommendationDetails(dto),
            tags: tagKeys ? { set: this.tagRefs(tagKeys) } : undefined,
          },
        });
        if (!lines) {
          await tx.travelRecommendationDish.updateMany({
            where: { recommendationId: id },
            data: { placeId },
          });
          return;
        }
        await tx.travelRecommendationDish.deleteMany({
          where: { recommendationId: id },
        });
        for (const [position, line] of lines.entries()) {
          await tx.travelRecommendationDish.create({
            data: {
              ...line,
              allergens: { connect: this.tagRefs(line.allergens) },
              recommendationId: id,
              placeId,
              position,
            },
          });
        }
      }),
    );
    if (dto.placeAreaId !== undefined) {
      await this.db.travelPlace.update({
        where: { id: placeId },
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

  private async resolveDishLines(
    inputs: TravelRecommendationDishInputDto[],
    userId: string,
  ) {
    const lines = [];
    const seen = new Set<string>();
    for (const input of inputs) {
      const dishId = await this.resolveDish(input, userId);
      if (seen.has(dishId)) continue;
      seen.add(dishId);
      lines.push({
        dishId,
        allergens: await this.resolveTagsOfKind(
          'ALLERGEN',
          input.allergens ?? [],
        ),
      });
    }
    return lines;
  }

  private async resolveTagLists(dto: UpdateTravelRecommendationDto) {
    const specials =
      dto.specials === undefined
        ? undefined
        : await this.resolveTagsOfKind('SPECIAL', dto.specials);
    const tags =
      dto.tags === undefined
        ? undefined
        : await this.resolveTagsOfKind('GENERAL', dto.tags);
    return { specials, tags };
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
    dto: TravelRecommendationDishInputDto,
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
    const categoryIds = await this.foodCategories.resolveIds(
      dto.foodCategories ?? [],
      userId,
    );
    const created = await this.db.travelDish.create({
      data: {
        name,
        createdById: userId,
        cuisines: { connect: cuisineIds.map((id) => ({ id })) },
        categories: { connect: categoryIds.map((id) => ({ id })) },
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

    const categoryIds = await this.placeCategories.resolveIds(
      dto.place.categories ?? [],
      userId,
    );
    const created = await this.db.travelPlace.create({
      data: {
        ...(await travelPlaceData(dto.place)),
        name,
        categories: { connect: categoryIds.map((id) => ({ id })) },
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
          'This place already has a pick for that dish',
        );
      }
      throw error;
    }
  }
}
