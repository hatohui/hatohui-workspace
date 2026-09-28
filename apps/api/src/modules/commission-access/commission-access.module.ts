import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionAccessController } from '@/modules/commission-access/commission-access.controller';
import { CommissionAccessService } from '@/modules/commission-access/services/commission-access.service';
import { AccessRateLimitGuard } from '@/modules/commission-access/guards/access-rate-limit.guard';

@Module({
  imports: [AuthModule],
  controllers: [CommissionAccessController],
  providers: [CommissionAccessService, AccessRateLimitGuard],
})
export class CommissionAccessModule {}
