import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionGroupsController } from '@/modules/commission-groups/commission-groups.controller';
import { CommissionGroupsService } from '@/modules/commission-groups/services/commission-groups.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionGroupsController],
  providers: [CommissionGroupsService],
})
export class CommissionGroupsModule {}
