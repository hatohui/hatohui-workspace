import { Module } from '@nestjs/common';
import { ConnectionsModule } from '@/modules/connections/connections.module';
import { ViewerContextService } from '@/modules/viewer-context/services/viewer-context.service';

@Module({
  imports: [ConnectionsModule],
  providers: [ViewerContextService],
  exports: [ViewerContextService],
})
export class ViewerContextModule {}
