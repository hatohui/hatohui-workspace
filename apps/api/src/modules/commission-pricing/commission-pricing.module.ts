import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionPricingController } from '@/modules/commission-pricing/commission-pricing.controller';
import { CommissionPricingService } from '@/modules/commission-pricing/services/commission-pricing.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionPricingController],
  providers: [CommissionPricingService],
})
export class CommissionPricingModule {}
