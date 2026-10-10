import { Injectable, NotFoundException } from '@nestjs/common';
import { ArtistsService } from '@/modules/artists/services/artists.service';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { ABOUT_DEFAULTS } from '@/modules/artist-about/artist-about.constants';
import {
  ArtistAboutDto,
  UpdateArtistAboutDto,
} from '@/modules/artist-about/dto/artist-about.dto';

const ABOUT = USER_SETTING_TYPES.artistAbout;

@Injectable()
export class ArtistAboutService {
  constructor(
    private readonly artists: ArtistsService,
    private readonly settings: UserSettingsService,
  ) {}

  async getForSite(): Promise<ArtistAboutDto> {
    const artist = await this.artists.findSiteArtist();
    if (!artist) throw new NotFoundException('Site artist not found');

    const stored = await this.settings.get(artist.id, ABOUT.scope, ABOUT.type);
    return stored ? this.parse(stored) : ABOUT_DEFAULTS;
  }

  async update(
    userId: string,
    dto: UpdateArtistAboutDto,
  ): Promise<ArtistAboutDto> {
    const about: ArtistAboutDto = {
      headline: dto.headline.trim(),
      intro: dto.intro.trim(),
      body: dto.body.trim(),
      facts: dto.facts.map((fact) => fact.trim()).filter(Boolean),
    };
    await this.settings.set(
      userId,
      ABOUT.scope,
      ABOUT.type,
      JSON.stringify(about),
    );
    return about;
  }

  private parse(stored: string): ArtistAboutDto {
    try {
      return { ...ABOUT_DEFAULTS, ...(JSON.parse(stored) as ArtistAboutDto) };
    } catch {
      return ABOUT_DEFAULTS;
    }
  }
}
