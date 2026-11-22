import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  STAGING_PREFIX,
  isStagedKey,
  travelRecommendationImageKeyFor,
} from '@/common/utils/asset-paths';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { TravelRecommendationImageThumbnailExecutor } from '@/modules/travel-recommendations/services/travel-recommendation-image-thumbnail.executor';

interface PlacedImage {
  key: string;
  thumbnailKey: string | null;
  previewKey: string | null;
  createdById: string | null;
}

@Injectable()
export class TravelRecommendationImagesService {
  private readonly logger = new Logger(TravelRecommendationImagesService.name);

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly processQueue: ProcessQueueService,
    private readonly thumbnailExecutor: TravelRecommendationImageThumbnailExecutor,
  ) {}

  async replace(
    recommendationId: string,
    keys: string[],
    uploaderId: string,
  ): Promise<void> {
    const existing = new Map(
      (await this.imagesOf(recommendationId)).map((image) => [
        image.key,
        image,
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
        placed.push({
          key: target,
          thumbnailKey: null,
          previewKey: null,
          createdById: uploaderId,
        });
      } else if (existing.has(key)) {
        placed.push(existing.get(key)!);
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

    const needsVariants = await this.db.travelRecommendationImage.findMany({
      where: { recommendationId, thumbnailKey: null },
      select: { id: true },
    });
    await Promise.all(
      needsVariants.map((image) => this.generateOrQueue(image.id)),
    );

    const kept = new Set(placed.map((image) => image.key));
    const removedKeys = [...existing.values()]
      .filter((image) => !kept.has(image.key))
      .flatMap((image) =>
        [image.key, image.thumbnailKey, image.previewKey].filter(
          (k): k is string => Boolean(k),
        ),
      );
    await this.deleteObjects(removedKeys);
  }

  async imagesOf(recommendationId: string): Promise<PlacedImage[]> {
    return this.db.travelRecommendationImage.findMany({
      where: { recommendationId },
      select: {
        key: true,
        thumbnailKey: true,
        previewKey: true,
        createdById: true,
      },
    });
  }

  async deleteObjects(keys: string[]): Promise<void> {
    await Promise.allSettled(keys.map((key) => this.storage.deleteObject(key)));
  }

  private async generateOrQueue(imageId: string): Promise<void> {
    try {
      await this.thumbnailExecutor.execute(imageId);
    } catch (error) {
      this.logger.warn(
        `Travel image thumbnail failed for ${imageId}, queued: ${error}`,
      );
      await this.processQueue.enqueueFailure(
        ProcessType.TRAVEL_RECOMMENDATION_IMAGE_THUMBNAIL,
        imageId,
        error,
      );
    }
  }
}
