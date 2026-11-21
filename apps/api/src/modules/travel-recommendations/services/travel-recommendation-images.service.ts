import { BadRequestException, Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  STAGING_PREFIX,
  isStagedKey,
  travelRecommendationImageKeyFor,
} from '@/common/utils/asset-paths';

interface PlacedImage {
  key: string;
  createdById: string | null;
}

@Injectable()
export class TravelRecommendationImagesService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
  ) {}

  async replace(
    recommendationId: string,
    keys: string[],
    uploaderId: string,
  ): Promise<void> {
    const existing = new Map(
      (await this.imagesOf(recommendationId)).map((image) => [
        image.key,
        image.createdById,
      ]),
    );
    const placed: PlacedImage[] = [];

    for (const key of [...new Set(keys)]) {
      if (isStagedKey(key)) {
        if (!key.startsWith(`${STAGING_PREFIX}/${uploaderId}/`)) {
          throw new BadRequestException("Cannot claim another uploader's file");
        }
        const target = travelRecommendationImageKeyFor(recommendationId, key);
        await this.storage.moveObject(key, target);
        placed.push({ key: target, createdById: uploaderId });
      } else if (existing.has(key)) {
        placed.push({ key, createdById: existing.get(key) ?? null });
      } else {
        throw new BadRequestException(`Unknown image key: ${key}`);
      }
    }

    await this.db.$transaction([
      this.db.travelRecommendationImage.deleteMany({
        where: { recommendationId },
      }),
      this.db.travelRecommendationImage.createMany({
        data: placed.map((image, position) => ({
          recommendationId,
          position,
          ...image,
        })),
      }),
    ]);

    const kept = new Set(placed.map((image) => image.key));
    await this.deleteObjects([...existing.keys()].filter((k) => !kept.has(k)));
  }

  async imagesOf(recommendationId: string): Promise<PlacedImage[]> {
    return this.db.travelRecommendationImage.findMany({
      where: { recommendationId },
      select: { key: true, createdById: true },
    });
  }

  async deleteObjects(keys: string[]): Promise<void> {
    await Promise.allSettled(keys.map((key) => this.storage.deleteObject(key)));
  }
}
