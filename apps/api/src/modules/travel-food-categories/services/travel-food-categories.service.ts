import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import {
  TravelFoodCategoryDto,
  UpdateTravelFoodCategoryDto,
} from '@/modules/travel-food-categories/dto/travel-food-category.dto';
import { TravelBulkResultDto } from '@/modules/travel-recommendations/dto/travel-bulk.dto';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';
import { uniqueNames } from '@/modules/travel-recommendations/utils/unique-names';

const foodCategorySelect = {
  id: true,
  name: true,
  createdAt: true,
  _count: { select: { dishes: true } },
} satisfies Prisma.TravelFoodCategorySelect;

type FoodCategoryRow = Prisma.TravelFoodCategoryGetPayload<{
  select: typeof foodCategorySelect;
}>;

@Injectable()
export class TravelFoodCategoriesService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelFoodCategoryDto[]> {
    const rows = await this.db.travelFoodCategory.findMany({
      orderBy: { name: 'asc' },
      select: foodCategorySelect,
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
    dto: UpdateTravelFoodCategoryDto,
  ): Promise<TravelFoodCategoryDto> {
    try {
      const row = await this.db.travelFoodCategory.update({
        where: { id },
        data: { name: dto.name?.trim() },
        select: foodCategorySelect,
      });
      return this.toDto(row);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async remove(id: string): Promise<void> {
    await this.db.travelFoodCategory.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Food category not found');
    });
  }

  async resolveIds(names: string[], userId: string): Promise<string[]> {
    const ids: string[] = [];
    for (const name of uniqueNames(names)) {
      const existing = await this.db.travelFoodCategory.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        select: { id: true },
      });
      const category =
        existing ??
        (await this.db.travelFoodCategory.create({
          data: { name, createdById: userId },
          select: { id: true },
        }));
      ids.push(category.id);
    }
    return ids;
  }

  private async findIds(names: string[]): Promise<string[]> {
    const rows = await this.db.travelFoodCategory.findMany({
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
          'A food category with that name already exists',
        );
      }
      return new NotFoundException('Food category not found');
    }
    return error as Error;
  }

  private toDto(row: FoodCategoryRow): TravelFoodCategoryDto {
    return {
      id: row.id,
      name: row.name,
      dishCount: row._count.dishes,
      createdAt: row.createdAt,
    };
  }
}
