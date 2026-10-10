import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ArtistsModule } from '@/modules/artists/artists.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { ArtistAboutController } from '@/modules/artist-about/artist-about.controller';
import { ArtistAboutService } from '@/modules/artist-about/services/artist-about.service';

@Module({
  imports: [AuthModule, ArtistsModule, UserSettingsModule],
  controllers: [ArtistAboutController],
  providers: [ArtistAboutService],
})
export class ArtistAboutModule {}
