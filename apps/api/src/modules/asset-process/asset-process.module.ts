import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { AssetProcessController } from '@/modules/asset-process/asset-process.controller';
import { AssetProcessService } from '@/modules/asset-process/services/asset-process.service';

@Module({
  imports: [AuthModule, AssetsModule, StorageCleanupModule],
  controllers: [AssetProcessController],
  providers: [AssetProcessService],
})
export class AssetProcessModule {}
