import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { TravelCuisineDto } from '@/modules/travel-cuisines/dto/travel-cuisine.dto';

@Injectable()
export class TravelCuisinesService {
  constructor(private readonly db: Database) {}

  async list(): Promise<TravelCuisineDto[]> {
    const rows = await this.db.travelCuisine.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, _count: { select: { dishes: true } } },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      dishCount: row._count.dishes,
    }));
  }

  async resolveIds(names: string[], userId: string): Promise<string[]> {
    const wanted = [
      ...new Map(
        names
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLowerCase(), name]),
      ).values(),
    ];

    const ids: string[] = [];
    for (const name of wanted) {
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
}
