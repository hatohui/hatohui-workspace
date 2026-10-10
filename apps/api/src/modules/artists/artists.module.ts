import { Module } from '@nestjs/common';
import { ArtistsController } from '@/modules/artists/artists.controller';
import { ArtistsService } from '@/modules/artists/services/artists.service';

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
