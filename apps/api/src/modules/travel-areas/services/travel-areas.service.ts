import { Injectable, NotFoundException } from '@nestjs/common';
import { Database } from '@/infra/db';
import {
  TravelAreaDto,
  UpdateTravelAreaDto,
} from '@/modules/travel-areas/dto/travel-area.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { translatePrismaError } from '@/modules/travel-recommendations/utils/prisma-errors';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';

const ERRORS = {
  conflict: 'That country already has an area with this name',
  notFound: 'Area not found',
};

const areaSelect = {
  id: true,
  countryId: true,
  name: true,
  _count: { select: { places: true } },
} as const;

@Injectable()
export class TravelAreasService {
  constructor(private readonly db: Database) {}

  async bulkCreate(
    countryId: string,
    names: string[],
    userId: string,
  ): Promise<TravelBulkResultDto> {
    const country = await this.db.travelCountry.findUnique({
      where: { id: countryId },
      select: { areas: { select: { name: true } } },
    });
    if (!country) throw new NotFoundException('Country not found');

    const taken = new Set(country.areas.map((a) => a.name.toLowerCase()));
    const fresh = uniqueNames(names).filter(
      (name) => !taken.has(name.toLowerCase()),
    );
    await this.db.travelArea.createMany({
      data: fresh.map((name) => ({ countryId, name, createdById: userId })),
      skipDuplicates: true,
    });
    return { created: fresh.length, skipped: names.length - fresh.length };
  }

  async update(id: string, dto: UpdateTravelAreaDto): Promise<TravelAreaDto> {
    try {
      const row = await this.db.travelArea.update({
        where: { id },
        data: { name: dto.name?.trim(), countryId: dto.countryId },
        select: areaSelect,
      });
      return {
        id: row.id,
        countryId: row.countryId,
        name: row.name,
        placeCount: row._count.places,
      };
    } catch (error) {
      throw translatePrismaError(error, ERRORS);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.db.travelArea.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error, ERRORS);
    }
  }
}
