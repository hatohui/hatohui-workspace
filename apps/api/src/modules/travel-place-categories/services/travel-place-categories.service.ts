import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  TravelPlaceCategoryDto,
  UpdateTravelPlaceCategoryDto,
} from '@/modules/travel-place-categories/dto/travel-place-category.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';

const placeCategorySelect = {
  id: true,
  name: true,
  createdAt: true,
  _count: { select: { places: true } },
} satisfies Prisma.TravelPlaceCategorySelect;

type PlaceCategoryRow = Prisma.TravelPlaceCategoryGetPayload<{
  select: typeof placeCategorySelect;
}>;

@Injectable()
export class TravelPlaceCategoriesService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelPlaceCategoryDto[]> {
    const rows = await this.db.travelPlaceCategory.findMany({
      orderBy: { name: 'asc' },
      select: placeCategorySelect,
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
    dto: UpdateTravelPlaceCategoryDto,
  ): Promise<TravelPlaceCategoryDto> {
    try {
      const row = await this.db.travelPlaceCategory.update({
        where: { id },
        data: { name: dto.name?.trim() },
        select: placeCategorySelect,
      });
      return this.toDto(row);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.db.travelPlaceCategory.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Place category not found');
    });
  }

  async resolveIds(names: string[], userId: string): Promise<string[]> {
    const ids: string[] = [];
    for (const name of uniqueNames(names)) {
      const existing = await this.db.travelPlaceCategory.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });
      const category =
        existing ??
        (await this.db.travelPlaceCategory.create({
          data: { name, createdById: userId },
          select: { id: true },
        }));
      ids.push(category.id);
    }
    return ids;
  }

  private async findIds(names: string[]): Promise<string[]> {
    const rows = await this.db.travelPlaceCategory.findMany({
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
        return new ConflictException(
          'A place category with that name already exists',
        );
      }
      return new NotFoundException('Place category not found');
    }
    return error as Error;
  }

  private toDto(row: PlaceCategoryRow): TravelPlaceCategoryDto {
    return {
      id: row.id,
      name: row.name,
      placeCount: row._count.places,
      createdAt: row.createdAt,
    };
  }
}
