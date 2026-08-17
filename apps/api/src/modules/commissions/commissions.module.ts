import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionsController } from '@/modules/commissions/commissions.controller';
import { CommissionsService } from '@/modules/commissions/services/commissions.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionsController],
  providers: [CommissionsService],
})
export class CommissionsModule {}
