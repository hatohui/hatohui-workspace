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
import { ArtistFaqService } from '@/modules/artist-faq/services/artist-faq.service';
import {
  ArtistFaqDto,
  UpdateArtistFaqDto,
} from '@/modules/artist-faq/dto/artist-faq.dto';

@ApiTags('artists')
@Controller('artist/faq')
export class ArtistFaqController {
  constructor(
    private readonly faq: ArtistFaqService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'artistFaq',
    summary: 'Questions and answers for the site artist',
  })
  @ApiOkResponse({ type: ArtistFaqDto })
  get(): Promise<ArtistFaqDto> {
    return this.faq.getForSite();
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'updateArtistFaq',
    summary: 'Replace your questions and answers',
  })
  @ApiOkResponse({ type: ArtistFaqDto })
  async update(
    @Body() dto: UpdateArtistFaqDto,
    @CurrentUser() user: User,
  ): Promise<ArtistFaqDto> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
    return this.faq.update(user.id, dto);
  }
}
