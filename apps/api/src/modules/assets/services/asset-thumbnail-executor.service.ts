import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { ProcessType } from '@prisma/client';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import {
  assetPreviewKeyFor,
  assetThumbnailKeyFor,
} from '@/common/utils/asset-paths';
import {
  fetchExternalImageBytes,
  generateVariants,
} from '@/modules/assets/utils/thumbnail';
import { artistFolderOf } from '@/modules/assets/utils/artist-folder';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';

@Injectable()
export class AssetThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.ASSET_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async execute(assetId: string): Promise<void> {
    const asset = await this.db.asset.findUniqueOrThrow({
      where: { id: assetId },
    });

    const original =
      asset.source === 'UPLOAD'
        ? await this.storage.getObjectBytes(asset.key as string)
        : await fetchExternalImageBytes(asset.publicUrl);

    const { thumbnail, preview } = await generateVariants(original);
    const artist = await artistFolderOf(this.db, asset.uploadedById);
    const source = asset.key ?? asset.filename;
    const thumbnailKey = assetThumbnailKeyFor(artist, source);
    const previewKey = assetPreviewKeyFor(artist, source);
    await Promise.all([
      this.storage.putObject(thumbnailKey, thumbnail, 'image/webp'),
      this.storage.putObject(previewKey, preview, 'image/webp'),
    ]);

    const { count } = await this.db.asset.updateMany({
      where: { id: assetId },
      data: {
        thumbnailKey,
        thumbnailUrl: this.storage.getPublicUrl(thumbnailKey),
        previewKey,
        previewUrl: this.storage.getPublicUrl(previewKey),
        thumbnailStatus: 'READY',
      },
    });

    const orphanedKeys =
      count === 0
        ? [thumbnailKey, previewKey]
        : [asset.thumbnailKey, asset.previewKey];
    await Promise.all(
      orphanedKeys.flatMap((key) =>
        key ? [this.storageCleanup.delete(key)] : [],
      ),
    );
  }
}
