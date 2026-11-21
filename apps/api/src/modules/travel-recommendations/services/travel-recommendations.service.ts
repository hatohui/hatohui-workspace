import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
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
    await this.assertTags(dto);
    const dishId = await this.resolveDish(dto, userId);
    const placeId = await this.resolvePlace(dto, userId);

    const created = await this.guardUnique(() =>
      this.db.travelRecommendation.create({
        data: {
          dishId,
          placeId,
          ...travelRecommendationDetails(dto),
          tags: { connect: this.tagRefs(travelTagKeys(dto, [])) },
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
    await this.assertTags(dto);
    const current = await this.get(id);
    const tagKeys = travelTagKeys(dto, [
      ...current.diets.map((key) => ({ key, kind: 'DIET' as const })),
      ...current.allergens.map((key) => ({ key, kind: 'ALLERGEN' as const })),
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
      select: { key: true },
    });
    return rows.map((row) => row.key);
  }

  deleteObjects(keys: string[]): Promise<void> {
    return this.images.deleteObjects(keys);
  }

  private toDto(row: TravelRecommendationRow): TravelRecommendationDto {
    return toTravelRecommendationDto(row, (key) =>
      this.storage.getPublicUrl(key),
    );
  }

  private async assertTags(dto: UpdateTravelRecommendationDto) {
    const wanted = [
      ...(dto.diets ?? []).map((key) => ({ key, kind: 'DIET' as const })),
      ...(dto.allergens ?? []).map((key) => ({
        key,
        kind: 'ALLERGEN' as const,
      })),
    ];
    if (!wanted.length) return;
    const found = await this.db.travelTag.findMany({
      where: { key: { in: wanted.map((tag) => tag.key) } },
      select: { key: true, kind: true },
    });
    const known = new Set(found.map((tag) => `${tag.kind}:${tag.key}`));
    const unknown = wanted.filter(
      (tag) => !known.has(`${tag.kind}:${tag.key}`),
    );
    if (unknown.length) {
      throw new BadRequestException(
        `Unknown tags: ${unknown.map((tag) => tag.key).join(', ')}`,
      );
    }
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
