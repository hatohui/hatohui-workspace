import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ProcessQueueModule } from '@/modules/process-queue/process-queue.module';
import { AssetsController } from '@/modules/assets/assets.controller';
import { AssetsService } from '@/modules/assets/services/assets.service';
import { AssetThumbnailExecutor } from '@/modules/assets/services/asset-thumbnail-executor.service';

@Module({
  imports: [AuthModule, ProcessQueueModule],
  controllers: [AssetsController],
  providers: [AssetsService, AssetThumbnailExecutor],
  exports: [AssetThumbnailExecutor],
})
export class AssetsModule {}
