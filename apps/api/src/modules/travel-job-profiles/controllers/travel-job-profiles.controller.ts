import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import {
  TravelJobProfileDto,
  TravelLeaveBalanceDto,
  UpsertTravelJobProfileDto,
} from '@/modules/travel-job-profiles/dto/travel-job-profile.dto';
import { TravelJobProfilesService } from '@/modules/travel-job-profiles/services/travel-job-profiles.service';

@ApiTags('travel')
@Controller('travel')
@UseGuards(AuthGuard)
export class TravelJobProfilesController {
  constructor(private readonly jobProfiles: TravelJobProfilesService) {}

  @Get('job-profiles/me')
  @ApiOperation({ operationId: 'myTravelJobProfile' })
  @ApiOkResponse({ type: TravelJobProfileDto })
  getMine(@CurrentUser() user: User): Promise<TravelJobProfileDto | null> {
    return this.jobProfiles.getMine(user.id);
  }

  @Put('job-profiles/me')
  @ApiOperation({ operationId: 'upsertMyTravelJobProfile' })
  @ApiOkResponse({ type: TravelJobProfileDto })
  upsertMine(
    @CurrentUser() user: User,
    @Body() dto: UpsertTravelJobProfileDto,
  ): Promise<TravelJobProfileDto> {
    return this.jobProfiles.upsertMine(user.id, dto);
  }

  @Post('job-profiles/me/confirm')
  @HttpCode(200)
  @ApiOperation({ operationId: 'confirmMyTravelJobProfile' })
  @ApiOkResponse({ type: TravelJobProfileDto })
  confirmMine(@CurrentUser() user: User): Promise<TravelJobProfileDto> {
    return this.jobProfiles.confirmMine(user.id);
  }

  @Get('leave-balance')
  @ApiOperation({ operationId: 'travelLeaveBalance' })
  @ApiOkResponse({ type: TravelLeaveBalanceDto })
  getLeaveBalance(@CurrentUser() user: User): Promise<TravelLeaveBalanceDto> {
    return this.jobProfiles.getLeaveBalance(user.id);
  }
}
