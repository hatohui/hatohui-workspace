import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { CommissionOpeningsModule } from '@/modules/commission-openings/commission-openings.module';
import { CommissionPricingModule } from '@/modules/commission-pricing/commission-pricing.module';
import { CommissionsController } from '@/modules/commissions/commissions.controller';
import { CommissionsService } from '@/modules/commissions/services/commissions.service';

@Module({
  imports: [
    AuthModule,
    UserSettingsModule,
    CommissionOpeningsModule,
    CommissionPricingModule,
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
