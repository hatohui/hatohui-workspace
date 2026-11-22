import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  PREVIEWS_SEGMENT,
  THUMBNAILS_SEGMENT,
  travelActivityVariantKeyFor,
  travelGroupVariantKeyFor,
} from '@/common/utils/asset-paths';
import { generateVariants } from '@/modules/assets/utils/thumbnail';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';

@Injectable()
export class TravelGroupImageThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.TRAVEL_GROUP_IMAGE_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(imageId: string): Promise<void> {
    const img = await this.db.travelGroupImage.findUnique({
      where: { id: imageId },
      select: {
        groupId: true,
        key: true,
        thumbnailKey: true,
        previewKey: true,
      },
    });
    if (!img?.key) return;

    const original = await this.storage.getObjectBytes(img.key);
    const { thumbnail, preview } = await generateVariants(original);
    const thumbnailKey = travelGroupVariantKeyFor(
      img.groupId,
      THUMBNAILS_SEGMENT,
      img.key,
    );
    const previewKey = travelGroupVariantKeyFor(
      img.groupId,
      PREVIEWS_SEGMENT,
      img.key,
    );

    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.travelGroupImage.updateMany({
      where: { id: imageId, key: img.key },
      data: { thumbnailKey, previewKey },
    });

    const orphaned =
      count === 0
        ? [thumbnailKey, previewKey]
        : [img.thumbnailKey, img.previewKey];
    await Promise.all(
      orphaned.flatMap((key) => (key ? [this.storageCleanup.delete(key)] : [])),
    );
  }
}

@Injectable()
export class TravelActivityImageThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.TRAVEL_ACTIVITY_IMAGE_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(activityId: string): Promise<void> {
    const act = await this.db.travelActivity.findUnique({
      where: { id: activityId },
      select: { imageKey: true, thumbnailKey: true, previewKey: true },
    });
    if (!act?.imageKey) return;

    const original = await this.storage.getObjectBytes(act.imageKey);
    const { thumbnail, preview } = await generateVariants(original);
    const thumbnailKey = travelActivityVariantKeyFor(
      activityId,
      THUMBNAILS_SEGMENT,
      act.imageKey,
    );
    const previewKey = travelActivityVariantKeyFor(
      activityId,
      PREVIEWS_SEGMENT,
      act.imageKey,
    );

    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.travelActivity.updateMany({
      where: { id: activityId, imageKey: act.imageKey },
      data: { thumbnailKey, previewKey },
    });

    const orphaned =
      count === 0
        ? [thumbnailKey, previewKey]
        : [act.thumbnailKey, act.previewKey];
    await Promise.all(
      orphaned.flatMap((key) => (key ? [this.storageCleanup.delete(key)] : [])),
    );
  }
}

@Injectable()
export class TravelActivityMediaThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.TRAVEL_ACTIVITY_MEDIA_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(mediaId: string): Promise<void> {
    const media = await this.db.travelActivityMedia.findUnique({
      where: { id: mediaId },
      select: {
        activityId: true,
        key: true,
        thumbnailKey: true,
        previewKey: true,
      },
    });
    if (!media?.key) return;

    const original = await this.storage.getObjectBytes(media.key);
    const { thumbnail, preview } = await generateVariants(original);
    const thumbnailKey = travelActivityVariantKeyFor(
      media.activityId,
      THUMBNAILS_SEGMENT,
      media.key,
    );
    const previewKey = travelActivityVariantKeyFor(
      media.activityId,
      PREVIEWS_SEGMENT,
      media.key,
    );

    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.travelActivityMedia.updateMany({
      where: { id: mediaId, key: media.key },
      data: { thumbnailKey, previewKey },
    });

    const orphaned =
      count === 0
        ? [thumbnailKey, previewKey]
        : [media.thumbnailKey, media.previewKey];
    await Promise.all(
      orphaned.flatMap((key) => (key ? [this.storageCleanup.delete(key)] : [])),
    );
  }
}
