import { BadRequestException, Injectable } from '@nestjs/common';
import { TravelTagKind } from '@prisma/client';
import { Database } from '@/infra/db';
import { TravelAllergiesDto } from '@/modules/travel-allergies/dto/travel-allergies.dto';

@Injectable()
export class TravelAllergiesService {
  constructor(private readonly db: Database) {}

  async get(userId: string): Promise<TravelAllergiesDto> {
    const tags = await this.db.travelTag.findMany({
      where: { allergicUsers: { some: { id: userId } } },
      select: { key: true },
      orderBy: { position: 'asc' },
    });
    return { allergens: tags.map((tag) => tag.key) };
  }

  async set(userId: string, keys: string[]): Promise<TravelAllergiesDto> {
    const unique = [...new Set(keys)];
    const tags = await this.db.travelTag.findMany({
      where: { key: { in: unique }, kind: TravelTagKind.ALLERGEN },
      select: { id: true },
    });
    if (tags.length !== unique.length) {
      throw new BadRequestException('Unknown allergen');
    }
    await this.db.user.update({
      where: { id: userId },
      data: { travelAllergens: { set: tags } },
    });
    return this.get(userId);
  }
}
