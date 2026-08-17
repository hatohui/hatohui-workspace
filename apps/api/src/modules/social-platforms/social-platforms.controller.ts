import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocialPlatformDto } from '@/modules/social-platforms/dto/social-platform.dto';
import { SocialPlatformsService } from '@/modules/social-platforms/services/social-platforms.service';

@ApiTags('platforms')
@Controller('platforms')
export class SocialPlatformsController {
  constructor(private readonly platformsService: SocialPlatformsService) {}

  @Get('socials')
  @ApiOperation({
    operationId: 'socialPlatforms',
    summary: 'List known social media platforms and their base URLs',
  })
  @ApiOkResponse({ type: SocialPlatformDto, isArray: true })
  findSocials(): Promise<SocialPlatformDto[]> {
    return this.platformsService.findSocials();
  }
}
