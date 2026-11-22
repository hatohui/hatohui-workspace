import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  TravelCuisineDto,
  UpdateTravelCuisineDto,
} from '@/modules/travel-cuisines/dto/travel-cuisine.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';

const cuisineSelect = {
  id: true,
  name: true,
  countries: { orderBy: { name: 'asc' }, select: { id: true } },
  areaId: true,
  createdAt: true,
  _count: { select: { dishes: true } },
} satisfies Prisma.TravelCuisineSelect;

type CuisineRow = Prisma.TravelCuisineGetPayload<{
  select: typeof cuisineSelect;
}>;

@Injectable()
export class TravelCuisinesService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelCuisineDto[]> {
    const rows = await this.db.travelCuisine.findMany({
      orderBy: { name: 'asc' },
      select: cuisineSelect,
    });
    return rows.map((row) => this.toDto(row));
  }

  async bulkCreate(
    names: string[],
    userId: string,
  ): Promise<TravelBulkResultDto> {
    const wanted = uniqueNames(names);
    const before = await this.findIds(wanted);
    await this.resolveIds(wanted, userId);
    return {
      created: wanted.length - before.length,
      skipped: names.length - (wanted.length - before.length),
    };
  }

  async update(
    id: string,
    dto: UpdateTravelCuisineDto,
  ): Promise<TravelCuisineDto> {
    const location = await this.locationOf(id, dto);
    try {
      const row = await this.db.travelCuisine.update({
        where: { id },
        data: { name: dto.name?.trim(), ...location },
        select: cuisineSelect,
      });
      return this.toDto(row);
    } catch (error) {
      throw this.translate(error);
    }
  }

  private async locationOf(
    id: string,
    dto: UpdateTravelCuisineDto,
  ): Promise<Prisma.TravelCuisineUpdateInput> {
    const countryIds =
      dto.countryIds === undefined
        ? undefined
        : [...new Set(dto.countryIds.map((cid) => cid.trim()).filter(Boolean))];
    if (countryIds?.length) {
      const found = await this.db.travelCountry.count({
        where: { id: { in: countryIds } },
      });
      if (found !== countryIds.length) {
        throw new NotFoundException('Country not found');
      }
    }

    if (dto.areaId) {
      const area = await this.db.travelArea.findUnique({
        where: { id: dto.areaId },
        select: { countryId: true },
      });
      if (!area) throw new NotFoundException('Area not found');
      const nextCountries = countryIds
        ? {
            set: [...new Set([...countryIds, area.countryId])].map((cid) => ({
              id: cid,
            })),
          }
        : { connect: { id: area.countryId } };
      return {
        area: { connect: { id: dto.areaId } },
        countries: nextCountries,
      };
    }

    if (countryIds !== undefined) {
      let clearArea = dto.areaId !== undefined;
      if (!clearArea) {
        const current = await this.db.travelCuisine.findUnique({
          where: { id },
          select: { area: { select: { countryId: true } } },
        });
        if (current?.area && !countryIds.includes(current.area.countryId)) {
          clearArea = true;
        }
      }
      return {
        ...(clearArea ? { area: { disconnect: true } } : {}),
        countries: { set: countryIds.map((cid) => ({ id: cid })) },
      };
    }

    return dto.areaId === undefined ? {} : { area: { disconnect: true } };
  }

  async remove(id: string): Promise<void> {
    await this.db.travelCuisine.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Cuisine not found');
    });
  }

  async resolveIds(names: string[], userId: string): Promise<string[]> {
    const ids: string[] = [];
    for (const name of uniqueNames(names)) {
      const existing = await this.db.travelCuisine.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });
      const cuisine =
        existing ??
        (await this.db.travelCuisine.create({
          data: { name, createdById: userId },
          select: { id: true },
        }));
      ids.push(cuisine.id);
    }
    return ids;
  }

  private async findIds(names: string[]): Promise<string[]> {
    const rows = await this.db.travelCuisine.findMany({
      where: {
        OR: names.map((name) => ({
          name: { equals: name, mode: 'insensitive' as const },
        })),
      },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  private translate(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        return new ConflictException('A cuisine with that name already exists');
      }
      return new NotFoundException('Cuisine not found');
    }
    return error as Error;
  }

  private toDto(row: CuisineRow): TravelCuisineDto {
    return {
      id: row.id,
      name: row.name,
      dishCount: row._count.dishes,
      countryIds: row.countries.map((country) => country.id),
      areaId: row.areaId,
      createdAt: row.createdAt,
    };
  }
}
