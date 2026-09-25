import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionsModule } from '@/modules/commissions/commissions.module';
import { CommissionOpeningsModule } from '@/modules/commission-openings/commission-openings.module';
import { ArtistDashboardController } from '@/modules/artist-dashboard/artist-dashboard.controller';
import { ArtistDashboardService } from '@/modules/artist-dashboard/services/artist-dashboard.service';

@Module({
  imports: [AuthModule, CommissionsModule, CommissionOpeningsModule],
  controllers: [ArtistDashboardController],
  providers: [ArtistDashboardService],
})
export class ArtistDashboardModule {}
