import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { ArtistsModule } from '@/modules/artists/artists.module';
import { UserSettingsModule } from '@/modules/user-settings/user-settings.module';
import { ArtistFaqController } from '@/modules/artist-faq/artist-faq.controller';
import { ArtistFaqService } from '@/modules/artist-faq/services/artist-faq.service';

@Module({
  imports: [AuthModule, ArtistsModule, UserSettingsModule],
  controllers: [ArtistFaqController],
  providers: [ArtistFaqService],
})
export class ArtistFaqModule {}
