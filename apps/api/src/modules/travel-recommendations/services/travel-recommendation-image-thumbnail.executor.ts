import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  PREVIEWS_SEGMENT,
  THUMBNAILS_SEGMENT,
  travelRecommendationVariantKeyFor,
} from '@/common/utils/asset-paths';
import { generateVariants } from '@/modules/assets/utils/thumbnail';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';

@Injectable()
export class TravelRecommendationImageThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.TRAVEL_RECOMMENDATION_IMAGE_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(imageId: string): Promise<void> {
    const image = await this.db.travelRecommendationImage.findUnique({
      where: { id: imageId },
      select: {
        recommendationId: true,
        key: true,
        thumbnailKey: true,
        previewKey: true,
      },
    });
    if (!image) return;

    const original = await this.storage.getObjectBytes(image.key);
    const { thumbnail, preview } = await generateVariants(original);
    const thumbnailKey = travelRecommendationVariantKeyFor(
      image.recommendationId,
      THUMBNAILS_SEGMENT,
      image.key,
    );
    const previewKey = travelRecommendationVariantKeyFor(
      image.recommendationId,
      PREVIEWS_SEGMENT,
      image.key,
    );

    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.travelRecommendationImage.updateMany({
      where: { id: imageId, key: image.key },
      data: { thumbnailKey, previewKey },
    });

    const orphaned =
      count === 0
        ? [thumbnailKey, previewKey]
        : [image.thumbnailKey, image.previewKey];
    await Promise.all(
      orphaned.flatMap((key) => (key ? [this.storageCleanup.delete(key)] : [])),
    );
  }
}
