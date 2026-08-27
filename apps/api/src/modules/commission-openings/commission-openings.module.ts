import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionOpeningsController } from '@/modules/commission-openings/commission-openings.controller';
import { CommissionOpeningsService } from '@/modules/commission-openings/services/commission-openings.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionOpeningsController],
  providers: [CommissionOpeningsService],
  exports: [CommissionOpeningsService],
})
export class CommissionOpeningsModule {}
