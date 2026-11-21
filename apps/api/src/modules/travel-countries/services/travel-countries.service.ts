import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  TravelCountryDto,
  UpdateTravelCountryDto,
} from '@/modules/travel-countries/dto/travel-country.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { translatePrismaError } from '@/modules/travel-recommendations/utils/prisma-errors';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';

const ERRORS = {
  conflict: 'A country with that name already exists',
  notFound: 'Country not found',
};

const countrySelect = {
  id: true,
  name: true,
  code: true,
  areas: {
    orderBy: { name: 'asc' },
    select: {
      id: true,
      countryId: true,
      name: true,
      _count: { select: { places: true } },
    },
  },
} satisfies Prisma.TravelCountrySelect;

type CountryRow = Prisma.TravelCountryGetPayload<{
  select: typeof countrySelect;
}>;

@Injectable()
export class TravelCountriesService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelCountryDto[]> {
    const rows = await this.db.travelCountry.findMany({
      orderBy: { name: 'asc' },
      select: countrySelect,
    });
    return rows.map((row) => this.toDto(row));
  }

  async bulkCreate(
    names: string[],
    userId: string,
  ): Promise<TravelBulkResultDto> {
    const wanted = uniqueNames(names);
    const existing = await this.db.travelCountry.findMany({
      where: {
        OR: wanted.map((name) => ({
          name: { equals: name, mode: 'insensitive' as const },
        })),
      },
      select: { name: true },
    });
    const taken = new Set(existing.map((row) => row.name.toLowerCase()));
    const fresh = wanted.filter((name) => !taken.has(name.toLowerCase()));
    await this.db.travelCountry.createMany({
      data: fresh.map((name) => ({ name, createdById: userId })),
      skipDuplicates: true,
    });
    return { created: fresh.length, skipped: names.length - fresh.length };
  }

  async update(
    id: string,
    dto: UpdateTravelCountryDto,
  ): Promise<TravelCountryDto> {
    try {
      const row = await this.db.travelCountry.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          code:
            dto.code === undefined ? undefined : dto.code.toUpperCase() || null,
        },
        select: countrySelect,
      });
      return this.toDto(row);
    } catch (error) {
      throw translatePrismaError(error, ERRORS);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.db.travelCountry.delete({ where: { id } });
    } catch (error) {
      throw translatePrismaError(error, ERRORS);
    }
  }

  private toDto(row: CountryRow): TravelCountryDto {
    const areas = row.areas.map((area) => ({
      id: area.id,
      countryId: area.countryId,
      name: area.name,
      placeCount: area._count.places,
    }));
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      placeCount: areas.reduce((sum, area) => sum + area.placeCount, 0),
      areas,
    };
  }
}
