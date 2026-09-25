import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ArtistDashboardService } from '@/modules/artist-dashboard/services/artist-dashboard.service';
import { ArtistDashboardDto } from '@/modules/artist-dashboard/dto/artist-dashboard.dto';

@ApiTags('artist-dashboard')
@Controller('artist-dashboard')
export class ArtistDashboardController {
  constructor(
    private readonly dashboard: ArtistDashboardService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'artistDashboard',
    summary: 'Summary of your commissions for the artist dashboard',
  })
  @ApiOkResponse({ type: ArtistDashboardDto })
  async get(@CurrentUser() user: User): Promise<ArtistDashboardDto> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
    return this.dashboard.get(user.id);
  }
}
