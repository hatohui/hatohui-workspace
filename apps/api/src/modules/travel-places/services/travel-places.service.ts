import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { resolveMapsLocation } from '@/common/utils/maps-coordinates';
import { MapsLinkPreviewDto } from '@/modules/travel-places/dto/maps-link-preview.dto';
import { travelPlaceData } from '@/modules/travel-recommendations/utils/travel-place-data';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import {
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
  createdBy: { select: travelCreatorSelect },
  _count: { select: { recommendations: true } },
  recommendations: {
    orderBy: { createdAt: 'desc' },
    select: {
      images: { orderBy: { position: 'asc' }, take: 1, select: { key: true } },
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
      where: contains
        ? {
            OR: [{ name: contains }, { address: contains }, { city: contains }],
          }
        : undefined,
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
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      mapsUrl: row.mapsUrl,
      latitude: row.latitude,
      longitude: row.longitude,
      note: row.note,
      dishCount: row._count.recommendations,
      coverImageUrl: cover ? this.storage.getPublicUrl(cover.key) : null,
      createdBy: toTravelCreatorDto(row.createdBy),
    };
  }
}
