import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionPricingController } from './commission-pricing.controller';
import { CommissionPricingService } from './commission-pricing.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionPricingController],
  providers: [CommissionPricingService],
})
export class CommissionPricingModule {}
