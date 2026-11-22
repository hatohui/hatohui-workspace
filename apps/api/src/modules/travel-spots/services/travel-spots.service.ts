import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, TravelTagKind } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { resolveMapsLocation } from '@/common/utils/maps-coordinates';
import { paginateList } from '@/common/utils/paginate';
import { matchesSearch, searchMatchRank } from '@/common/utils/text-search';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { MAPS_LINK_ENTRY } from '@/modules/travel-places/travel-places.constants';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';
import { sortTravelCatalog } from '@/modules/travel-recommendations/utils/travel-catalog-sort';
import {
  toTravelPlaceAreaDto,
  travelAreaFilter,
  travelPlaceAreaSelect,
} from '@/modules/travel-recommendations/utils/travel-place-area';
import { travelPlaceData } from '@/modules/travel-recommendations/utils/travel-place-data';
import {
  toTravelCreatorDto,
  travelCreatorFilter,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import { tagKeyOf } from '@/modules/travel-tags/utils/tag-key';
import { TravelSpotCategoriesService } from '@/modules/travel-spot-categories/services/travel-spot-categories.service';
import { TravelSpotImagesService } from '@/modules/travel-spots/services/travel-spot-images.service';
import {
  CreateTravelSpotDto,
  PaginatedTravelSpotsDto,
  TravelSpotDto,
  TravelSpotPageQueryDto,
  TravelSpotQueryDto,
  UpdateTravelSpotDto,
} from '@/modules/travel-spots/dto/travel-spot.dto';

const spotInclude = {
  area: travelPlaceAreaSelect,
  categories: {
    orderBy: { name: 'asc' },
    select: { name: true },
  },
  tags: {
    orderBy: { position: 'asc' },
    select: { key: true, kind: true },
  },
  images: {
    orderBy: { position: 'asc' },
    select: {
      key: true,
      thumbnailKey: true,
      previewKey: true,
      createdById: true,
    },
  },
  createdBy: { select: travelCreatorSelect },
} satisfies Prisma.TravelSpotInclude;

type SpotRow = Prisma.TravelSpotGetPayload<{ include: typeof spotInclude }>;

@Injectable()
export class TravelSpotsService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly spotCategories: TravelSpotCategoriesService,
    private readonly images: TravelSpotImagesService,
  ) {}

  async list(query: TravelSpotQueryDto): Promise<TravelSpotDto[]> {
    const q = query.q?.trim() ?? '';
    const rows = await this.db.travelSpot.findMany({
      where: {
        ...travelAreaFilter(query),
        ...(query.spotCategories?.length
          ? {
              categories: {
                some: {
                  OR: query.spotCategories.map((name) => ({
                    name: { equals: name, mode: 'insensitive' as const },
                  })),
                },
              },
            }
          : {}),
        ...(query.tags?.length
          ? {
              AND: query.tags.map((key) => ({
                tags: { some: { key } },
              })),
            }
          : {}),
        ...(query.excludeTags?.length
          ? {
              tags: { none: { key: { in: query.excludeTags } } },
            }
          : {}),
        createdBy: travelCreatorFilter(query.by),
      },
      include: spotInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const matched = q
      ? rows
          .filter((row) =>
            matchesSearch(q, [
              row.name,
              ...row.categories.map((c) => c.name),
              row.address,
              row.note,
              row.area?.name,
              row.area?.country.name,
              ...row.tags.map((t) => t.key),
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
      (spot) => spot.images.length,
    );
  }

  async listPage(
    query: TravelSpotPageQueryDto,
  ): Promise<PaginatedTravelSpotsDto> {
    const all = await this.list(query);
    return paginateList(all, query.page, query.pageSize);
  }

  async get(id: string): Promise<TravelSpotDto> {
    const row = await this.db.travelSpot.findUnique({
      where: { id },
      include: spotInclude,
    });
    if (!row) throw new NotFoundException('Spot not found');
    return this.toDto(row);
  }

  async create(
    dto: CreateTravelSpotDto,
    userId: string,
  ): Promise<TravelSpotDto> {
    const data = await travelPlaceData(dto);
    const categories = await this.categoryRefs(dto.categories, userId);
    const tagKeys = await this.resolveSpotTagKeys(dto, []);

    const created = await this.db.travelSpot.create({
      data: {
        ...data,
        name: dto.name.trim(),
        categories: { connect: categories },
        tags: { connect: tagKeys.map((key) => ({ key })) },
        createdById: userId,
      },
    });
    if (dto.imageKeys?.length) {
      await this.images.replace(created.id, dto.imageKeys, userId);
    }
    return this.get(created.id);
  }

  async bulkCreate(
    entries: string[],
    areaId: string | undefined,
    userId: string,
  ): Promise<TravelBulkResultDto> {
    const spots = await Promise.all(
      uniqueNames(entries).map((entry) => this.spotFromEntry(entry)),
    );
    const named = spots.filter(
      (spot): spot is NonNullable<typeof spot> => spot !== null,
    );
    if (named.length === 0) {
      return { created: 0, skipped: entries.length };
    }
    const existing = await this.db.travelSpot.findMany({
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
          .filter((spot) => !taken.has(spot.name.toLowerCase()))
          .map((spot) => [spot.name.toLowerCase(), spot]),
      ).values(),
    ];
    await this.db.travelSpot.createMany({
      data: fresh.map((spot) => ({
        ...spot,
        areaId: areaId || null,
        createdById: userId,
      })),
    });
    return { created: fresh.length, skipped: entries.length - fresh.length };
  }

  private async spotFromEntry(entry: string) {
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
    dto: UpdateTravelSpotDto,
    userId: string,
  ): Promise<TravelSpotDto> {
    const current = await this.get(id);
    const data = await travelPlaceData(dto);
    const categories =
      dto.categories !== undefined
        ? await this.categoryRefs(dto.categories, userId)
        : undefined;
    const shouldUpdateTags =
      dto.specials !== undefined || dto.tags !== undefined;
    const tagKeys = shouldUpdateTags
      ? await this.resolveSpotTagKeys(dto, [
          ...current.specials.map((key) => ({
            key,
            kind: 'SPECIAL' as const,
          })),
          ...current.tags.map((key) => ({
            key,
            kind: 'GENERAL' as const,
          })),
        ])
      : undefined;

    await this.db.travelSpot.update({
      where: { id },
      data: {
        ...data,
        categories: categories ? { set: categories } : undefined,
        tags: tagKeys ? { set: tagKeys.map((key) => ({ key })) } : undefined,
      },
    });
    if (dto.imageKeys !== undefined) {
      await this.images.replace(id, dto.imageKeys, userId);
    }
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const existingImages = await this.images.imagesOf(id);
    await this.db.travelSpot.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Spot not found');
    });
    const keys = existingImages.flatMap((img) =>
      [img.key, img.thumbnailKey, img.previewKey].filter((k): k is string =>
        Boolean(k),
      ),
    );
    await this.images.deleteObjects(keys);
  }

  private async categoryRefs(names: string[] | undefined, userId: string) {
    const ids = await this.spotCategories.resolveIds(names ?? [], userId);
    return ids.map((id) => ({ id }));
  }

  private async resolveSpotTagKeys(
    dto: { specials?: string[]; tags?: string[] },
    fallback: { key: string; kind: TravelTagKind }[],
  ): Promise<string[]> {
    const specials =
      dto.specials !== undefined
        ? await this.resolveTagsOfKind('SPECIAL', dto.specials)
        : fallback.filter((t) => t.kind === 'SPECIAL').map((t) => t.key);
    const generals =
      dto.tags !== undefined
        ? await this.resolveTagsOfKind('GENERAL', dto.tags)
        : fallback.filter((t) => t.kind === 'GENERAL').map((t) => t.key);
    return [...new Set([...specials, ...generals])];
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

  private toDto(row: SpotRow): TravelSpotDto {
    const publicUrlOf = (key: string) => this.storage.getPublicUrl(key);
    const tagsOf = (kind: TravelTagKind) =>
      row.tags.filter((tag) => tag.kind === kind).map((tag) => tag.key);
    const cover = row.images[0];
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
      specials: tagsOf('SPECIAL'),
      tags: tagsOf('GENERAL'),
      images: row.images.map(
        ({ key, thumbnailKey, previewKey, createdById }) => ({
          key,
          url: publicUrlOf(key),
          thumbnailUrl: thumbnailKey ? publicUrlOf(thumbnailKey) : null,
          previewUrl: previewKey ? publicUrlOf(previewKey) : null,
          createdById,
        }),
      ),
      coverImageUrl: coverKey ? publicUrlOf(coverKey) : null,
      createdBy: toTravelCreatorDto(row.createdBy),
      createdAt: row.createdAt,
    };
  }
}
