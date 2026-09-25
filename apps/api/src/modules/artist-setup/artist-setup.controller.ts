import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ArtistSetupService } from '@/modules/artist-setup/services/artist-setup.service';
import { ArtistSetupDto } from '@/modules/artist-setup/dto/artist-setup.dto';

@ApiTags('artist-setup')
@Controller('artist-setup')
@UseGuards(AuthGuard)
export class ArtistSetupController {
  constructor(
    private readonly setup: ArtistSetupService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'artistSetup',
    summary: 'Where you are in first-time commission setup',
  })
  @ApiOkResponse({ type: ArtistSetupDto })
  async get(@CurrentUser() user: User): Promise<ArtistSetupDto> {
    await this.assertArtist(user);
    return this.setup.get(user.id);
  }

  @Post('dismiss')
  @ApiOperation({
    operationId: 'dismissArtistSetup',
    summary: 'Skip first-time setup; the workspace stops sending you there',
  })
  @ApiOkResponse({ type: ArtistSetupDto })
  async dismiss(@CurrentUser() user: User): Promise<ArtistSetupDto> {
    await this.assertArtist(user);
    return this.setup.dismiss(user.id);
  }

  private async assertArtist(user: User): Promise<void> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
  }
}
