import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ArtistAboutService } from '@/modules/artist-about/services/artist-about.service';
import {
  ArtistAboutDto,
  UpdateArtistAboutDto,
} from '@/modules/artist-about/dto/artist-about.dto';

@ApiTags('artists')
@Controller('artist/about')
export class ArtistAboutController {
  constructor(
    private readonly about: ArtistAboutService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'artistAbout',
    summary: 'About page content for the site artist',
  })
  @ApiOkResponse({ type: ArtistAboutDto })
  get(): Promise<ArtistAboutDto> {
    return this.about.getForSite();
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateArtistAbout',
    summary: 'Replace your About page content',
  })
  @ApiOkResponse({ type: ArtistAboutDto })
  async update(
    @Body() dto: UpdateArtistAboutDto,
    @CurrentUser() user: User,
  ): Promise<ArtistAboutDto> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
    return this.about.update(user.id, dto);
  }
}
