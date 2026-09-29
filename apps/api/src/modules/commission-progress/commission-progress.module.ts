import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CommissionAttachmentsModule } from '@/modules/commission-attachments/commission-attachments.module';
import { CommissionProgressController } from '@/modules/commission-progress/commission-progress.controller';
import { CommissionProgressService } from '@/modules/commission-progress/services/commission-progress.service';

@Module({
  imports: [AuthModule, AssetsModule, CommissionAttachmentsModule],
  controllers: [CommissionProgressController],
  providers: [CommissionProgressService],
})
export class CommissionProgressModule {}
