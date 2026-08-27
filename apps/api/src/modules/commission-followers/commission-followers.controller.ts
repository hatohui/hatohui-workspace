import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/services/auth.service';
import type { User } from '@prisma/client';
import { CommissionFollowersService } from '@/modules/commission-followers/services/commission-followers.service';
import {
  CommissionFollowerDto,
  SubscribeCommissionFollowerDto,
} from '@/modules/commission-followers/dto/commission-follower.dto';

@ApiTags('commission-followers')
@Controller('commission-followers')
export class CommissionFollowersController {
  constructor(
    private readonly followersService: CommissionFollowersService,
    private readonly auth: AuthService,
  ) {}

  @Post()
  @HttpCode(204)
  @ApiOperation({
    operationId: 'subscribeToCommissionOpenings',
    summary: "Subscribe an email to an artist's opening announcements",
  })
  async subscribe(@Body() dto: SubscribeCommissionFollowerDto): Promise<void> {
    return this.followersService.subscribe(dto.artistId, dto.email);
  }

  @Get('unsubscribe/:token')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'unsubscribeFromCommissionOpenings',
    summary: 'Unsubscribe via the link sent in an announcement email',
  })
  async unsubscribe(@Param('token') token: string): Promise<void> {
    return this.followersService.unsubscribe(token);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'myCommissionFollowers',
    summary: 'List your active followers',
  })
  @ApiOkResponse({ type: CommissionFollowerDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<CommissionFollowerDto[]> {
    if (!(await this.auth.isArtist(user))) {
      throw new ForbiddenException('Artist access denied');
    }
    return this.followersService.listMine(user.id);
  }
}
