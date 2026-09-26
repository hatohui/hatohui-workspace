import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CommissionProgressController } from '@/modules/commission-progress/commission-progress.controller';
import { CommissionProgressService } from '@/modules/commission-progress/services/commission-progress.service';

@Module({
  imports: [AuthModule, AssetsModule],
  controllers: [CommissionProgressController],
  providers: [CommissionProgressService],
})
export class CommissionProgressModule {}
