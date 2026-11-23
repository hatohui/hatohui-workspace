import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  STAGING_PREFIX,
  isStagedKey,
  travelSpotImageKeyFor,
} from '@/common/utils/asset-paths';
import { ProcessQueueService } from '@/modules/process-queue/services/process-queue.service';
import { TravelSpotImageThumbnailExecutor } from '@/modules/travel-spots/services/travel-spot-image-thumbnail.executor';

interface PlacedSpotImage {
  key: string;
  thumbnailKey: string | null;
  previewKey: string | null;
  createdById: string | null;
}

@Injectable()
export class TravelSpotImagesService {
  private readonly logger = new Logger(TravelSpotImagesService.name);

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly processQueue: ProcessQueueService,
    private readonly thumbnailExecutor: TravelSpotImageThumbnailExecutor,
  ) {}

  async replace(
    spotId: string,
    keys: string[],
    uploaderId: string,
  ): Promise<void> {
    const existing = new Map(
      (await this.imagesOf(spotId)).map((image) => [image.key, image]),
    );
    const placed: PlacedSpotImage[] = [];

    for (const key of [...new Set(keys)]) {
      if (isStagedKey(key)) {
        if (!key.startsWith(`${STAGING_PREFIX}/${uploaderId}/`)) {
          throw new BadRequestException("Cannot claim another uploader's file");
        }
        const target = travelSpotImageKeyFor(spotId, key);
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
      this.db.travelSpotImage.deleteMany({
        where: { spotId },
      }),
      this.db.travelSpotImage.createMany({
        data: placed.map((image, position) => ({
          spotId,
          position,
          ...image,
        })),
      }),
    ]);

    const needsVariants = await this.db.travelSpotImage.findMany({
      where: { spotId, thumbnailKey: null },
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

  async imagesOf(spotId: string): Promise<PlacedSpotImage[]> {
    return this.db.travelSpotImage.findMany({
      where: { spotId },
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
        `Travel spot image thumbnail failed for ${imageId}, queued: ${error}`,
      );
      await this.processQueue.enqueueFailure(
        ProcessType.TRAVEL_SPOT_IMAGE_THUMBNAIL,
        imageId,
        error,
      );
    }
  }
}
