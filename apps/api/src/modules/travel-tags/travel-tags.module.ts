import { Module } from '@nestjs/common';
import { TravelAccessModule } from '@/modules/travel-access/travel-access.module';
import { TravelTagsController } from '@/modules/travel-tags/travel-tags.controller';
import { TravelTagsService } from '@/modules/travel-tags/services/travel-tags.service';

@Module({
  imports: [TravelAccessModule],
  controllers: [TravelTagsController],
  providers: [TravelTagsService],
})
export class TravelTagsModule {}
