import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  TravelSpotCategoryDto,
  UpdateTravelSpotCategoryDto,
} from '@/modules/travel-spot-categories/dto/travel-spot-category.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';

const spotCategorySelect = {
  id: true,
  name: true,
  createdAt: true,
  _count: { select: { spots: true } },
} satisfies Prisma.TravelSpotCategorySelect;

type SpotCategoryRow = Prisma.TravelSpotCategoryGetPayload<{
  select: typeof spotCategorySelect;
}>;

@Injectable()
export class TravelSpotCategoriesService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelSpotCategoryDto[]> {
    const rows = await this.db.travelSpotCategory.findMany({
      orderBy: { name: 'asc' },
      select: spotCategorySelect,
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
    dto: UpdateTravelSpotCategoryDto,
  ): Promise<TravelSpotCategoryDto> {
    try {
      const row = await this.db.travelSpotCategory.update({
        where: { id },
        data: { name: dto.name?.trim() },
        select: spotCategorySelect,
      });
      return this.toDto(row);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.db.travelSpotCategory.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Spot category not found');
    });
  }

  async resolveIds(names: string[], userId: string): Promise<string[]> {
    const ids: string[] = [];
    for (const name of uniqueNames(names)) {
      const existing = await this.db.travelSpotCategory.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });
      const category =
        existing ??
        (await this.db.travelSpotCategory.create({
          data: { name, createdById: userId },
          select: { id: true },
        }));
      ids.push(category.id);
    }
    return ids;
  }

  private async findIds(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];
    const rows = await this.db.travelSpotCategory.findMany({
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
          'A spot category with that name already exists',
        );
      }
      return new NotFoundException('Spot category not found');
    }
    return error as Error;
  }

  private toDto(row: SpotCategoryRow): TravelSpotCategoryDto {
    return {
      id: row.id,
      name: row.name,
      spotCount: row._count.spots,
      createdAt: row.createdAt,
    };
  }
}
