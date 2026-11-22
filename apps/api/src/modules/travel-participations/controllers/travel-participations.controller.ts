import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import {
  AcceptTravelInviteDto,
  CreateTravelParticipationDto,
  InviteTravelMemberDto,
  KickTravelMemberDto,
  TransferTravelOwnershipDto,
  TravelJoinRequestDto,
  TravelParticipationDetailDto,
  TravelParticipationDto,
  TravelParticipationGroupDto,
  TravelParticipationQueryDto,
  TravelSharePlanDto,
  UpdateTravelGroupSettingsDto,
  UpdateTravelParticipationDatesDto,
} from '@/modules/travel-participations/dto/travel-participation.dto';
import { TravelParticipationsService } from '@/modules/travel-participations/services/travel-participations.service';

@ApiTags('travel')
@Controller('travel/participations')
export class TravelParticipationsController {
  constructor(private readonly participations: TravelParticipationsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'myTravelParticipations' })
  @ApiOkResponse({ type: TravelParticipationDto, isArray: true })
  listMine(
    @CurrentUser() user: User,
    @Query() query: TravelParticipationQueryDto,
  ): Promise<TravelParticipationDto[]> {
    return this.participations.listMine(user.id, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createTravelParticipation' })
  @ApiOkResponse({ type: TravelParticipationDetailDto })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateTravelParticipationDto,
  ): Promise<TravelParticipationDetailDto> {
    return this.participations.create(user.id, dto);
  }

  @Get(':id/share')
  @ApiOperation({ operationId: 'travelParticipationShare' })
  @ApiOkResponse({ type: TravelSharePlanDto })
  getShare(@Param('id') id: string): Promise<TravelSharePlanDto> {
    return this.participations.getShare(id);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'travelParticipation' })
  @ApiOkResponse({ type: TravelParticipationDetailDto })
  getDetail(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ): Promise<TravelParticipationDetailDto> {
    return this.participations.getDetail(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateTravelParticipationDates' })
  @ApiOkResponse({ type: TravelParticipationDetailDto })
  updateDates(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTravelParticipationDatesDto,
  ): Promise<TravelParticipationDetailDto> {
    return this.participations.updateDates(id, user.id, dto);
  }

  @Patch(':id/settings')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateTravelGroupSettings' })
  @ApiOkResponse({ type: TravelParticipationGroupDto })
  updateGroupSettings(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateTravelGroupSettingsDto,
  ): Promise<TravelParticipationGroupDto> {
    return this.participations.updateGroupSettings(id, user.id, dto);
  }

  @Post(':id/invite')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'inviteTravelMember' })
  @ApiNoContentResponse()
  invite(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: InviteTravelMemberDto,
  ): Promise<void> {
    return this.participations.inviteMember(id, user.id, dto.userId);
  }

  @Post(':id/invite/accept')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'acceptTravelInvite' })
  @ApiOkResponse({ type: TravelParticipationDetailDto })
  acceptInvite(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: AcceptTravelInviteDto,
  ): Promise<TravelParticipationDetailDto> {
    return this.participations.acceptInvite(id, user.id, dto);
  }

  @Post(':id/invite/decline')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'declineTravelInvite' })
  @ApiNoContentResponse()
  declineInvite(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.participations.declineInvite(id, user.id);
  }

  @Get(':id/join-requests')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'travelJoinRequests' })
  @ApiOkResponse({ type: TravelJoinRequestDto, isArray: true })
  listJoinRequests(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<TravelJoinRequestDto[]> {
    return this.participations.listJoinRequests(id, user.id);
  }

  @Post(':id/join-requests')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createTravelJoinRequest' })
  @ApiOkResponse({ type: TravelJoinRequestDto })
  requestJoin(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<TravelJoinRequestDto> {
    return this.participations.requestJoin(id, user.id);
  }

  @Post(':id/join-requests/:requestId/approve')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'approveTravelJoinRequest' })
  @ApiNoContentResponse()
  approveJoinRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.participations.approveJoinRequest(id, requestId, user.id);
  }

  @Post(':id/join-requests/:requestId/reject')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'rejectTravelJoinRequest' })
  @ApiNoContentResponse()
  rejectJoinRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.participations.rejectJoinRequest(id, requestId, user.id);
  }

  @Post(':id/kick')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'kickTravelMember' })
  @ApiNoContentResponse()
  kick(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: KickTravelMemberDto,
  ): Promise<void> {
    return this.participations.kickMember(id, user.id, dto.userId);
  }

  @Post(':id/leave')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'leaveTravelGroup' })
  @ApiNoContentResponse()
  leave(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    return this.participations.leaveGroup(id, user.id);
  }

  @Post(':id/transfer')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'transferTravelOwnership' })
  @ApiNoContentResponse()
  transfer(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: TransferTravelOwnershipDto,
  ): Promise<void> {
    return this.participations.transferOwnership(id, user.id, dto.newOwnerId);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'deleteTravelGroup' })
  @ApiNoContentResponse()
  deleteGroup(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.participations.deleteGroup(id, user.id);
  }
}
