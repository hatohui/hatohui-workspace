import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ArtistsController } from '@/modules/artists/artists.controller';
import { ArtistsService } from '@/modules/artists/services/artists.service';

@Module({
  imports: [AuthModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
