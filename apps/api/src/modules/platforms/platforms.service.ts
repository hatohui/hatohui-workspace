import { Injectable } from '@nestjs/common';
import { Database } from '@/libs/db';
import { SocialPlatformDto } from './dto/platform.dto';

@Injectable()
export class PlatformsService {
  constructor(private readonly db: Database) {}

  async findSocials(): Promise<SocialPlatformDto[]> {
    const platforms = await this.db.socialPlatform.findMany({
      orderBy: { name: 'asc' },
    });
    return platforms.map((platform) => ({
      id: platform.id,
      key: platform.key,
      name: platform.name,
      baseUrl: platform.baseUrl,
    }));
  }
}
