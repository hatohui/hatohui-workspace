import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { CommissionTypesController } from '@/modules/commission-types/commission-types.controller';
import { CommissionTypesService } from '@/modules/commission-types/services/commission-types.service';

@Module({
  imports: [AuthModule],
  controllers: [CommissionTypesController],
  providers: [CommissionTypesService],
  exports: [CommissionTypesService],
})
export class CommissionTypesModule {}
