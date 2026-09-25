import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { CommissionPricingModule } from '@/modules/commission-pricing/commission-pricing.module';
import { CommissionTypesModule } from '@/modules/commission-types/commission-types.module';
import { ArtistSetupController } from '@/modules/artist-setup/artist-setup.controller';
import { ArtistSetupService } from '@/modules/artist-setup/services/artist-setup.service';

@Module({
  imports: [
    AuthModule,
    UserSettingsModule,
    CommissionPricingModule,
    CommissionTypesModule,
  ],
  controllers: [ArtistSetupController],
  providers: [ArtistSetupService],
})
export class ArtistSetupModule {}
