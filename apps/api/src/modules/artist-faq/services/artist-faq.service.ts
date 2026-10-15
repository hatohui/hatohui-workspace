import { Injectable, NotFoundException } from '@nestjs/common';
import { ArtistsService } from '@/modules/artists/services/artists.service';
import { UserSettingsService } from '@/modules/user-settings/services/user-settings.service';
import { USER_SETTING_TYPES } from '@/modules/user-settings/user-settings.constants';
import { FAQ_DEFAULTS } from '@/modules/artist-faq/artist-faq.constants';
import {
  ArtistFaqDto,
  UpdateArtistFaqDto,
} from '@/modules/artist-faq/dto/artist-faq.dto';

const FAQ = USER_SETTING_TYPES.artistFaq;

@Injectable()
export class ArtistFaqService {
  constructor(
    private readonly artists: ArtistsService,
    private readonly settings: UserSettingsService,
  ) {}

  async getForSite(): Promise<ArtistFaqDto> {
    const artist = await this.artists.findSiteArtist();
    if (!artist) throw new NotFoundException('Site artist not found');

    const stored = await this.settings.get(artist.id, FAQ.scope, FAQ.type);
    return stored ? this.parse(stored) : FAQ_DEFAULTS;
  }

  async update(userId: string, dto: UpdateArtistFaqDto): Promise<ArtistFaqDto> {
    const faq: ArtistFaqDto = {
      items: dto.items
        .map((item) => ({
          question: item.question.trim(),
          answer: item.answer.trim(),
        }))
        .filter((item) => item.question && item.answer),
    };
    await this.settings.set(userId, FAQ.scope, FAQ.type, JSON.stringify(faq));
    return faq;
  }

  private parse(stored: string): ArtistFaqDto {
    try {
      const parsed = JSON.parse(stored) as ArtistFaqDto;
      return Array.isArray(parsed.items) ? parsed : FAQ_DEFAULTS;
    } catch {
      return FAQ_DEFAULTS;
    }
  }
}
