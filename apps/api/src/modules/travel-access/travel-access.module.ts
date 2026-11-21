import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { TravelAccessController } from '@/modules/travel-access/travel-access.controller';
import { TravelAccessService } from '@/modules/travel-access/services/travel-access.service';
import { TravelEditorGuard } from '@/modules/travel-access/guards/travel-editor.guard';

@Module({
  imports: [AuthModule],
  controllers: [TravelAccessController],
  providers: [TravelAccessService, TravelEditorGuard],
  exports: [TravelAccessService, TravelEditorGuard, AuthModule],
})
export class TravelAccessModule {}
