import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import { ProcessType } from '@prisma/client';
import type { ProcessExecutor } from '@/modules/process-queue/process-queue.constants';
import { assetThumbnailKeyFor } from '@/common/utils/asset-paths';
import {
  fetchExternalImageBytes,
  generateThumbnail,
} from '@/modules/assets/utils/thumbnail';

@Injectable()
export class AssetThumbnailExecutor implements ProcessExecutor {
  readonly type = ProcessType.ASSET_THUMBNAIL;

  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
  ) {}

  async execute(assetId: string): Promise<void> {
    const asset = await this.db.asset.findUniqueOrThrow({
      where: { id: assetId },
    });

    const original =
      asset.source === 'UPLOAD'
        ? await this.storage.getObjectBytes(asset.key as string)
        : await fetchExternalImageBytes(asset.publicUrl);

    const thumbnail = await generateThumbnail(original);
    const thumbnailKey = assetThumbnailKeyFor(asset.key ?? asset.filename);
    await this.storage.putObject(thumbnailKey, thumbnail, 'image/webp');

    await this.db.asset.update({
      where: { id: assetId },
      data: {
        thumbnailKey,
        thumbnailUrl: this.storage.getPublicUrl(thumbnailKey),
        thumbnailStatus: 'READY',
      },
    });
  }
}
