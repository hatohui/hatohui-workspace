import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { PaymentMethodsModule } from '@/modules/payment-methods/payment-methods.module';
import { CommissionPricingController } from '@/modules/commission-pricing/commission-pricing.controller';
import { CommissionPricingService } from '@/modules/commission-pricing/services/commission-pricing.service';

@Module({
  imports: [AuthModule, UserSettingsModule, PaymentMethodsModule],
  controllers: [CommissionPricingController],
  providers: [CommissionPricingService],
  exports: [CommissionPricingService],
})
export class CommissionPricingModule {}
