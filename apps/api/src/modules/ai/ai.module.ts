import { Module } from '@nestjs/common';
import { AiService } from '@/modules/ai/services/ai.service';

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
