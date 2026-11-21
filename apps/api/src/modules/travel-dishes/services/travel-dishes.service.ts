import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { TravelRecommendationsService } from '@/modules/travel-recommendations/services/travel-recommendations.service';
import { UNIQUE_VIOLATION_CODE } from '@/modules/travel-recommendations/travel-recommendations.constants';
import {
  toTravelCreatorDto,
  travelCreatorSelect,
} from '@/modules/travel-recommendations/utils/travel-creator';
import {
  CreateTravelDishDto,
  TravelDishDetailDto,
  TravelDishDto,
  TravelDishQueryDto,
  UpdateTravelDishDto,
} from '@/modules/travel-dishes/dto/travel-dish.dto';

const dishInclude = {
  createdBy: { select: travelCreatorSelect },
  _count: { select: { recommendations: true } },
  recommendations: {
    orderBy: { createdAt: 'desc' },
    select: {
      images: { orderBy: { position: 'asc' }, take: 1, select: { key: true } },
    },
  },
} satisfies Prisma.TravelDishInclude;

type DishRow = Prisma.TravelDishGetPayload<{ include: typeof dishInclude }>;

@Injectable()
export class TravelDishesService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly recommendations: TravelRecommendationsService,
  ) {}

  async list(query: TravelDishQueryDto): Promise<TravelDishDto[]> {
    const q = query.q?.trim();
    const contains = q ? { contains: q, mode: 'insensitive' as const } : null;
    const rows = await this.db.travelDish.findMany({
      where: contains
        ? { OR: [{ name: contains }, { cuisine: contains }] }
        : undefined,
      include: dishInclude,
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async get(id: string): Promise<TravelDishDetailDto> {
    const row = await this.db.travelDish.findUnique({
      where: { id },
      include: dishInclude,
    });
    if (!row) throw new NotFoundException('Dish not found');
    const recommendations = await this.recommendations.list({ dishId: id });
    return { ...this.toDto(row), recommendations };
  }

  async create(
    dto: CreateTravelDishDto,
    userId: string,
  ): Promise<TravelDishDetailDto> {
    const created = await this.guardUnique(() =>
      this.db.travelDish.create({
        data: { ...this.fieldsOf(dto), createdById: userId },
      }),
    );
    return this.get(created.id);
  }

  async update(
    id: string,
    dto: UpdateTravelDishDto,
  ): Promise<TravelDishDetailDto> {
    await this.get(id);
    await this.guardUnique(() =>
      this.db.travelDish.update({ where: { id }, data: this.fieldsOf(dto) }),
    );
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const keys = await this.recommendations.imageKeysWhere({ dishId: id });
    await this.db.travelDish.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Dish not found');
    });
    await this.recommendations.deleteObjects(keys);
  }

  private fieldsOf(dto: UpdateTravelDishDto) {
    const optional = (value: string | undefined) =>
      value === undefined ? undefined : value.trim() || null;
    return {
      name: dto.name?.trim(),
      cuisine: optional(dto.cuisine),
      description: optional(dto.description),
    } as { name: string; cuisine?: string | null; description?: string | null };
  }

  private toDto(row: DishRow): TravelDishDto {
    const cover = row.recommendations.find((r) => r.images.length)?.images[0];
    return {
      id: row.id,
      name: row.name,
      cuisine: row.cuisine,
      description: row.description,
      placeCount: row._count.recommendations,
      coverImageUrl: cover ? this.storage.getPublicUrl(cover.key) : null,
      createdBy: toTravelCreatorDto(row.createdBy),
    };
  }

  private async guardUnique<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION_CODE
      ) {
        throw new ConflictException('A dish with that name already exists');
      }
      throw error;
    }
  }
}
