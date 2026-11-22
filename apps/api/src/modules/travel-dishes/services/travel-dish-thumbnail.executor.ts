import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  PREVIEWS_SEGMENT,
  THUMBNAILS_SEGMENT,
  travelDishVariantKeyFor,
} from '@/common/utils/asset-paths';
import { generateVariants } from '@/modules/assets/utils/thumbnail';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';

@Injectable()
export class TravelDishThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.TRAVEL_DISH_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(dishId: string): Promise<void> {
    const dish = await this.db.travelDish.findUnique({
      where: { id: dishId },
      select: { imageKey: true, thumbnailKey: true, previewKey: true },
    });
    if (!dish?.imageKey) return;

    const original = await this.storage.getObjectBytes(dish.imageKey);
    const { thumbnail, preview } = await generateVariants(original);
    const thumbnailKey = travelDishVariantKeyFor(
      dishId,
      THUMBNAILS_SEGMENT,
      dish.imageKey,
    );
    const previewKey = travelDishVariantKeyFor(
      dishId,
      PREVIEWS_SEGMENT,
      dish.imageKey,
    );

    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.travelDish.updateMany({
      where: { id: dishId, imageKey: dish.imageKey },
      data: { thumbnailKey, previewKey },
    });

    const orphaned =
      count === 0
        ? [thumbnailKey, previewKey]
        : [dish.thumbnailKey, dish.previewKey];
    await Promise.all(
      orphaned.flatMap((key) => (key ? [this.storageCleanup.delete(key)] : [])),
    );
  }
}
