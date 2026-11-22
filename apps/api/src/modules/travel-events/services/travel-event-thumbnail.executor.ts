import { Injectable } from '@nestjs/common';
import { ProcessType } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  PREVIEWS_SEGMENT,
  THUMBNAILS_SEGMENT,
  travelEventVariantKeyFor,
} from '@/common/utils/asset-paths';
import { generateVariants } from '@/modules/assets/utils/thumbnail';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';

@Injectable()
export class TravelEventThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.TRAVEL_EVENT_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(eventId: string): Promise<void> {
    const event = await this.db.travelEvent.findUnique({
      where: { id: eventId },
      select: { imageKey: true, thumbnailKey: true, previewKey: true },
    });
    if (!event?.imageKey) return;

    const original = await this.storage.getObjectBytes(event.imageKey);
    const { thumbnail, preview } = await generateVariants(original);
    const thumbnailKey = travelEventVariantKeyFor(
      eventId,
      THUMBNAILS_SEGMENT,
      event.imageKey,
    );
    const previewKey = travelEventVariantKeyFor(
      eventId,
      PREVIEWS_SEGMENT,
      event.imageKey,
    );

    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.travelEvent.updateMany({
      where: { id: eventId, imageKey: event.imageKey },
      data: { thumbnailKey, previewKey },
    });

    const orphaned =
      count === 0
        ? [thumbnailKey, previewKey]
        : [event.thumbnailKey, event.previewKey];
    await Promise.all(
      orphaned.flatMap((key) => (key ? [this.storageCleanup.delete(key)] : [])),
    );
  }
}
