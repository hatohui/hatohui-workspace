import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { StorageCleanupModule } from '@/modules/storage-cleanup/storage-cleanup.module';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelAdminParticipationsController } from '@/modules/travel-participations/controllers/travel-admin-participations.controller';
import { TravelParticipationsController } from '@/modules/travel-participations/controllers/travel-participations.controller';
import { TravelParticipationsService } from '@/modules/travel-participations/services/travel-participations.service';

@Module({
  imports: [AuthModule, TravelAccessModule, StorageCleanupModule],
  controllers: [
    TravelParticipationsController,
    TravelAdminParticipationsController,
  ],
  providers: [TravelParticipationsService],
  exports: [TravelParticipationsService],
})
export class TravelParticipationsModule {}
