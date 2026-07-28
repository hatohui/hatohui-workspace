import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocialPlatformDto } from './dto/platform.dto';
import { PlatformsService } from './platforms.service';

@ApiTags('platforms')
@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

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
