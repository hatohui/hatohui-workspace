import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { resolveMapsLocation } from '@/common/utils/maps-coordinates';
import { paginateList } from '@/common/utils/paginate';
import { matchesSearch, searchMatchRank } from '@/common/utils/text-search';
import { MapsLinkPreviewDto } from '@/modules/travel-places/dto/maps-link-preview.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';
import { sortTravelCatalog } from '@/modules/travel-recommendations/utils/travel-catalog-sort';
import { MAPS_LINK_ENTRY } from '@/modules/travel-places/travel-places.constants';
import {
  toTravelPlaceAreaDto,
  travelAreaFilter,
  travelPlaceAreaSelect,
} from '@/modules/travel-recommendations/utils/travel-place-area';
import { travelPlaceData } from '@/modules/travel-recommendations/utils/travel-place-data';
import {
  travelAllergenTagsSelect,
  uniqueAllergenKeys,
} from '@/modules/travel-recommendations/utils/travel-allergen-keys';
import { travelRecommendationWhere } from '@/modules/travel-recommendations/utils/travel-recommendation-filters';
import { travelPlaceCategoryNamesSelect } from '@/modules/travel-recommendations/utils/travel-recommendation.mapper';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import { TravelPlaceCategoriesService } from '@/modules/travel-place-categories/services/travel-place-categories.service';
import {
  travelCreatorFilter,
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import {
  CreateTravelPlaceDto,
  PaginatedTravelPlacesDto,
  TravelPlaceDetailDto,
  TravelPlaceDto,
  TravelPlacePageQueryDto,
  TravelPlaceQueryDto,
  UpdateTravelPlaceDto,
} from '@/modules/travel-places/dto/travel-place.dto';

const placeInclude = {
  area: travelPlaceAreaSelect,
  categories: travelPlaceCategoryNamesSelect,
  createdBy: { select: travelCreatorSelect },
  _count: { select: { recommendations: true } },
  recommendations: {
    orderBy: { createdAt: 'desc' },
    select: {
      tags: travelAllergenTagsSelect,
      images: {
        orderBy: { position: 'asc' },
        take: 1,
        select: { key: true, thumbnailKey: true },
      },
    },
  },
} satisfies Prisma.TravelPlaceInclude;

type PlaceRow = Prisma.TravelPlaceGetPayload<{ include: typeof placeInclude }>;

@Injectable()
export class TravelPlacesService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly recommendations: TravelRecommendationsService,
    private readonly placeCategories: TravelPlaceCategoriesService,
  ) {}

  async list(query: TravelPlaceQueryDto): Promise<TravelPlaceDto[]> {
    const q = query.q?.trim() ?? '';
    const rows = await this.db.travelPlace.findMany({
      where: {
        ...travelAreaFilter(query),
        ...(query.placeCategories?.length
          ? {
              categories: {
                some: {
                  OR: query.placeCategories.map((name) => ({
                    name: { equals: name, mode: 'insensitive' as const },
                  })),
                },
              },
            }
          : {}),
        createdBy: travelCreatorFilter(query.by),
        recommendations: this.servesMatchingFood(query),
      },
      include: placeInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    const matched = q
      ? rows
          .filter((row) =>
            matchesSearch(q, [
              row.name,
              ...row.categories.map((c) => c.name),
              row.address,
              row.area?.name,
              row.area?.country.name,
            ]),
          )
          .sort(
            (a, b) =>
              searchMatchRank(q, a.name) - searchMatchRank(q, b.name) ||
              b.createdAt.getTime() - a.createdAt.getTime() ||
              b.id.localeCompare(a.id),
          )
      : rows;
    return sortTravelCatalog(
      matched.map((row) => this.toDto(row)),
      query.sort,
      (place) => place.dishCount,
    );
  }

  async listPage(
    query: TravelPlacePageQueryDto,
  ): Promise<PaginatedTravelPlacesDto> {
    const all = await this.list(query);
    return paginateList(all, query.page, query.pageSize);
  }

  private servesMatchingFood(
    query: TravelPlaceQueryDto,
  ): Prisma.TravelRecommendationListRelationFilter | undefined {
    const { tags, excludeTags, excludeAllergens, cuisines, foodCategories } =
      query;
    const isFiltered = [
      tags,
      excludeTags,
      excludeAllergens,
      cuisines,
      foodCategories,
    ].some((list) => list?.length);
    if (!isFiltered) return undefined;
    return {
      some: travelRecommendationWhere({
        tags,
        excludeTags,
        excludeAllergens,
        cuisines,
        foodCategories,
      }),
    };
  }

  async get(id: string): Promise<TravelPlaceDetailDto> {
    const row = await this.db.travelPlace.findUnique({
      where: { id },
      include: placeInclude,
    });
    if (!row) throw new NotFoundException('Place not found');
    const recommendations = await this.recommendations.list({ placeId: id });
    return { ...this.toDto(row), recommendations };
  }

  async create(
    dto: CreateTravelPlaceDto,
    userId: string,
  ): Promise<TravelPlaceDetailDto> {
    const data = await travelPlaceData(dto);
    const categories = await this.categoryRefs(dto.categories, userId);
    const created = await this.db.travelPlace.create({
      data: {
        ...data,
        name: dto.name.trim(),
        categories: { connect: categories },
        createdById: userId,
      },
    });
    return this.get(created.id);
  }

  async bulkCreate(
    entries: string[],
    areaId: string | undefined,
    userId: string,
  ): Promise<TravelBulkResultDto> {
    const places = await Promise.all(
      uniqueNames(entries).map((entry) => this.placeFromEntry(entry)),
    );
    const named = places.filter(
      (place): place is NonNullable<typeof place> => place !== null,
    );
    const existing = await this.db.travelPlace.findMany({
      where: {
        OR: named.map(({ name }) => ({
          name: { equals: name, mode: 'insensitive' as const },
        })),
      },
      select: { name: true },
    });
    const taken = new Set(existing.map((row) => row.name.toLowerCase()));
    const fresh = [
      ...new Map(
        named
          .filter((place) => !taken.has(place.name.toLowerCase()))
          .map((place) => [place.name.toLowerCase(), place]),
      ).values(),
    ];
    await this.db.travelPlace.createMany({
      data: fresh.map((place) => ({
        ...place,
        areaId: areaId || null,
        createdById: userId,
      })),
    });
    return { created: fresh.length, skipped: entries.length - fresh.length };
  }

  private async placeFromEntry(entry: string) {
    if (!MAPS_LINK_ENTRY.test(entry)) return { name: entry };
    const location = await resolveMapsLocation(entry);
    if (!location.name) return null;
    return {
      name: location.name,
      mapsUrl: entry,
      latitude: location.coordinates?.latitude ?? null,
      longitude: location.coordinates?.longitude ?? null,
    };
  }

  async update(
    id: string,
    dto: UpdateTravelPlaceDto,
    userId: string,
  ): Promise<TravelPlaceDetailDto> {
    await this.get(id);
    const data = await travelPlaceData(dto);
    const categories =
      dto.categories !== undefined
        ? await this.categoryRefs(dto.categories, userId)
        : undefined;
    await this.db.travelPlace.update({
      where: { id },
      data: {
        ...data,
        categories: categories ? { set: categories } : undefined,
      },
    });
    return this.get(id);
  }

  private async categoryRefs(names: string[] | undefined, userId: string) {
    const ids = await this.placeCategories.resolveIds(names ?? [], userId);
    return ids.map((id) => ({ id }));
  }

  async previewLink(url: string): Promise<MapsLinkPreviewDto> {
    const location = await resolveMapsLocation(url.trim());
    return {
      latitude: location.coordinates?.latitude ?? null,
      longitude: location.coordinates?.longitude ?? null,
      name: location.name,
    };
  }

  async remove(id: string): Promise<void> {
    const keys = await this.recommendations.imageKeysWhere({ placeId: id });
    await this.db.travelPlace.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Place not found');
    });
    await this.recommendations.deleteObjects(keys);
  }

  private toDto(row: PlaceRow): TravelPlaceDto {
    const cover = row.recommendations.find((r) => r.images.length)?.images[0];
    const coverKey = cover?.thumbnailKey ?? cover?.key;
    return {
      id: row.id,
      name: row.name,
      area: toTravelPlaceAreaDto(row.area),
      categories: row.categories.map((category) => category.name),
      address: row.address,
      mapsUrl: row.mapsUrl,
      latitude: row.latitude,
      longitude: row.longitude,
      note: row.note,
      allergens: uniqueAllergenKeys(row.recommendations),
      dishCount: row._count.recommendations,
      coverImageUrl: coverKey ? this.storage.getPublicUrl(coverKey) : null,
      createdBy: toTravelCreatorDto(row.createdBy),
      createdAt: row.createdAt,
    };
  }
}
