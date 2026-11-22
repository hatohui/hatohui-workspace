import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { resolveMapsLocation } from '@/common/utils/maps-coordinates';
import { MapsLinkPreviewDto } from '@/modules/travel-places/dto/maps-link-preview.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';
import { MAPS_LINK_ENTRY } from '@/modules/travel-places/travel-places.constants';
import {
  toTravelPlaceAreaDto,
  travelAreaFilter,
  travelPlaceAreaSelect,
} from '@/modules/travel-recommendations/utils/travel-place-area';
import { travelPlaceData } from '@/modules/travel-recommendations/utils/travel-place-data';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import {
  travelCreatorFilter,
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import {
  CreateTravelPlaceDto,
  TravelPlaceDetailDto,
  TravelPlaceDto,
  TravelPlaceQueryDto,
  UpdateTravelPlaceDto,
} from '@/modules/travel-places/dto/travel-place.dto';

const placeInclude = {
  area: travelPlaceAreaSelect,
  createdBy: { select: travelCreatorSelect },
  _count: { select: { recommendations: true } },
  recommendations: {
    orderBy: { createdAt: 'desc' },
    select: {
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
  ) {}

  async list(query: TravelPlaceQueryDto): Promise<TravelPlaceDto[]> {
    const q = query.q?.trim();
    const contains = q ? { contains: q, mode: 'insensitive' as const } : null;
    const rows = await this.db.travelPlace.findMany({
      where: {
        ...travelAreaFilter(query),
        createdBy: travelCreatorFilter(query.by),
        OR: contains
          ? [{ name: contains }, { address: contains }, { city: contains }]
          : undefined,
      },
      include: placeInclude,
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
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
    const created = await this.db.travelPlace.create({
      data: { ...data, name: dto.name.trim(), createdById: userId },
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
  ): Promise<TravelPlaceDetailDto> {
    await this.get(id);
    const data = await travelPlaceData(dto);
    await this.db.travelPlace.update({ where: { id }, data });
    return this.get(id);
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
      address: row.address,
      city: row.city,
      mapsUrl: row.mapsUrl,
      latitude: row.latitude,
      longitude: row.longitude,
      note: row.note,
      dishCount: row._count.recommendations,
      coverImageUrl: coverKey ? this.storage.getPublicUrl(coverKey) : null,
      createdBy: toTravelCreatorDto(row.createdBy),
    };
  }
}
