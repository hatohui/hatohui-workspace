import { BadRequestException, Injectable } from '@nestjs/common';
import type { AssetProcessStep, User } from '@prisma/client';
import { Database } from '@/infra/db';
import { Storage } from '@/infra/storage';
import {
  isStagedKey,
  processImageKeyFor,
  STAGING_PREFIX,
} from '@/common/utils/asset-paths';
import { AssetsService } from '@/modules/assets/services/assets.service';
import { artistFolderOf } from '@/modules/assets/utils/artist-folder';
import { StorageCleanupService } from '@/modules/storage-cleanup/services/storage-cleanup.service';
import {
  AssetProcessStepDto,
  ReplaceAssetProcessDto,
} from '@/modules/asset-process/dto/asset-process.dto';

@Injectable()
export class AssetProcessService {
  constructor(
    private readonly db: Database,
    private readonly storage: Storage,
    private readonly assets: AssetsService,
    private readonly storageCleanup: StorageCleanupService,
  ) {}

  async list(
    assetId: string,
    viewer: User | null,
  ): Promise<AssetProcessStepDto[]> {
    await this.assets.get(assetId, viewer);
    return this.stepsOf(assetId);
  }

  async replace(
    assetId: string,
    dto: ReplaceAssetProcessDto,
    actor: User,
  ): Promise<AssetProcessStepDto[]> {
    const asset = await this.assets.assertEditable(assetId, actor);
    const existing = await this.db.assetProcessStep.findMany({
      where: { assetId },
    });
    const existingKeys = new Set(existing.map((step) => step.key));
    const ownerId = asset.uploadedById ?? actor.id;

    for (const { key } of dto.steps) {
      if (existingKeys.has(key)) continue;
      if (
        !isStagedKey(key) ||
        !key.startsWith(`${STAGING_PREFIX}/${actor.id}/`)
      ) {
        throw new BadRequestException(`Unknown process image ${key}`);
      }
    }

    const folder = await artistFolderOf(this.db, ownerId);
    const keys = await Promise.all(
      dto.steps.map(async ({ key }) => {
        if (existingKeys.has(key)) return key;
        const target = processImageKeyFor(folder, key);
        await this.storage.moveObject(key, target);
        return target;
      }),
    );

    const kept = new Set(keys);
    const removed = existing.filter((step) => !kept.has(step.key));

    await this.db.$transaction([
      this.db.assetProcessStep.deleteMany({ where: { assetId } }),
      this.db.assetProcessStep.createMany({
        data: dto.steps.map((step, position) => ({
          assetId,
          key: keys[position],
          imageUrl: this.storage.getPublicUrl(keys[position]),
          label: step.label?.trim() || null,
          position,
        })),
      }),
    ]);
    await Promise.all(
      removed.map((step) => this.storageCleanup.delete(step.key)),
    );

    return this.stepsOf(assetId);
  }

  private async stepsOf(assetId: string): Promise<AssetProcessStepDto[]> {
    const steps = await this.db.assetProcessStep.findMany({
      where: { assetId },
      orderBy: { position: 'asc' },
    });
    return steps.map(toDto);
  }
}

function toDto(step: AssetProcessStep): AssetProcessStepDto {
  return {
    id: step.id,
    key: step.key,
    imageUrl: step.imageUrl,
    label: step.label,
    position: step.position,
  };
}
