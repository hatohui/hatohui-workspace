import { Injectable } from '@nestjs/common';
import { Database } from '@/infra/db';
import { SocialPlatformDto } from '@/modules/social-platforms/dto/social-platform.dto';

@Injectable()
export class SocialPlatformsService {
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
