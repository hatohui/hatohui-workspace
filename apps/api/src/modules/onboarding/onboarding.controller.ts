import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  AddConnectionsDto,
  OnboardingStateDto,
  OptInDto,
  SetBirthdayDto,
  SetProfileDto,
  SetVisibilityDto,
} from '@/modules/onboarding/dto/onboarding.dto';
import { OnboardingService } from '@/modules/onboarding/services/onboarding.service';
import type { User } from '@prisma/client';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'onboardingState',
    summary: 'Current onboarding status and in-progress entry, if any',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  getState(@CurrentUser() viewer: User): Promise<OnboardingStateDto> {
    return this.onboardingService.getState(viewer);
  }

  @Post('opt-in')
  @ApiOperation({
    operationId: 'onboardingOptIn',
    summary: 'Step 1: opt in (or decline) to join the list',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  optIn(
    @Body() dto: OptInDto,
    @CurrentUser() viewer: User,
  ): Promise<OnboardingStateDto> {
    return this.onboardingService.optIn(dto, viewer);
  }

  @Patch('profile')
  @ApiOperation({
    operationId: 'onboardingSetProfile',
    summary: 'Step 2: confirm or rewrite your display name',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  setProfile(
    @Body() dto: SetProfileDto,
    @CurrentUser() viewer: User,
  ): Promise<OnboardingStateDto> {
    return this.onboardingService.setProfile(dto, viewer);
  }

  @Patch('visibility')
  @ApiOperation({
    operationId: 'onboardingSetVisibility',
    summary: 'Step 3: set visibility mode for your entry',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  setVisibility(
    @Body() dto: SetVisibilityDto,
    @CurrentUser() viewer: User,
  ): Promise<OnboardingStateDto> {
    return this.onboardingService.setVisibility(dto, viewer);
  }

  @Patch('birthday')
  @ApiOperation({
    operationId: 'onboardingSetBirthday',
    summary:
      'Step 4: confirm or enter your birthday (skipped if visibility is None)',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  setBirthday(
    @Body() dto: SetBirthdayDto,
    @CurrentUser() viewer: User,
  ): Promise<OnboardingStateDto> {
    return this.onboardingService.setBirthday(dto, viewer);
  }

  @Post('connections')
  @ApiOperation({
    operationId: 'onboardingAddConnections',
    summary: 'Step 5: record which existing entries you already know',
  })
  addConnections(
    @Body() dto: AddConnectionsDto,
    @CurrentUser() viewer: User,
  ): Promise<void> {
    return this.onboardingService.addConnections(dto, viewer);
  }

  @Post('complete')
  @ApiOperation({
    operationId: 'onboardingComplete',
    summary: 'Step 6: mark onboarding as complete',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  complete(@CurrentUser() viewer: User): Promise<OnboardingStateDto> {
    return this.onboardingService.complete(viewer);
  }

  @Post('skip')
  @ApiOperation({
    operationId: 'onboardingSkip',
    summary: 'Abandon onboarding at any step; never re-prompted automatically',
  })
  @ApiOkResponse({ type: OnboardingStateDto })
  skip(@CurrentUser() viewer: User): Promise<OnboardingStateDto> {
    return this.onboardingService.skip(viewer);
  }
}
