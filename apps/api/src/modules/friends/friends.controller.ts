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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { OptionalCurrentUser } from '../auth/optional-current-user.decorator';
import {
  CreateFriendDto,
  FriendDto,
  SocialGraphDto,
  UpdateFriendDto,
} from './dto/friend.dto';
import {
  FriendSearchQueryDto,
  PaginatedFriendsDto,
} from './dto/friend-search.dto';
import { AvatarVersionsDto } from '@/modules/avatars/dto/avatar-version.dto';
import {
  BirthdaysByMonthDto,
  MonthQueryDto,
  PaginatedUpcomingSectionsDto,
  UpcomingSectionsQueryDto,
} from './dto/friend-upcoming.dto';
import { ProfilesService } from './profiles.service';
import { BirthdaysService } from './birthdays.service';
import { SocialGraphService } from './social-graph.service';
import type { User } from '@prisma/client';

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly birthdays: BirthdaysService,
    private readonly socialGraph: SocialGraphService,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'friends', summary: 'List all friends' })
  @ApiOkResponse({ type: FriendDto, isArray: true })
  findAll(@OptionalCurrentUser() viewer: User | null): Promise<FriendDto[]> {
    return this.profiles.findAll(viewer);
  }

  @Get('upcoming/sections')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'upcomingFriendSections',
    summary:
      "Paginated, grouped upcoming birthdays for the timeline's infinite scroll",
  })
  @ApiOkResponse({ type: PaginatedUpcomingSectionsDto })
  findUpcomingSections(
    @Query() query: UpcomingSectionsQueryDto,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<PaginatedUpcomingSectionsDto> {
    return this.birthdays.findUpcomingSections(
      query.query,
      query.group ?? 'month',
      query.direction ?? 'asc',
      query.page ?? 1,
      query.pageSize ?? 30,
      viewer,
    );
  }

  @Get('birthdays-by-month')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'birthdaysByMonth',
    summary: 'Friends whose birthday falls in a given calendar month',
  })
  @ApiOkResponse({ type: BirthdaysByMonthDto })
  findBirthdaysByMonth(
    @Query() query: MonthQueryDto,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<BirthdaysByMonthDto> {
    return this.birthdays.findBirthdaysByMonth(
      query.month,
      query.query,
      viewer,
    );
  }

  @Get('search')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'searchFriends',
    summary:
      'Paginated, name-filtered friend search (used by the onboarding connections picker)',
  })
  @ApiOkResponse({ type: PaginatedFriendsDto })
  search(
    @Query() query: FriendSearchQueryDto,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<PaginatedFriendsDto> {
    return this.profiles.search(
      query.query,
      query.page ?? 1,
      query.pageSize ?? 20,
      viewer,
    );
  }

  @Get('social-graph')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'friendsSocialGraph',
    summary: 'Data for the social tree view',
  })
  @ApiOkResponse({ type: SocialGraphDto })
  getSocialGraph(@CurrentUser() viewer: User): Promise<SocialGraphDto> {
    return this.socialGraph.getSocialGraph(viewer);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'friend',
    summary: 'Get a friend by id or by the @handle of its associated account',
  })
  @ApiOkResponse({ type: FriendDto })
  findOne(
    @Param('id') id: string,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<FriendDto> {
    return this.profiles.findOne(id, viewer);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createFriend', summary: 'Create a friend' })
  @ApiOkResponse({ type: FriendDto })
  create(
    @Body() dto: CreateFriendDto,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.profiles.create(dto, viewer);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'updateFriend', summary: 'Update a friend' })
  @ApiOkResponse({ type: FriendDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFriendDto,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.profiles.update(id, dto, viewer);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteFriend', summary: 'Delete a friend' })
  remove(@Param('id') id: string, @CurrentUser() viewer: User): Promise<void> {
    return this.profiles.remove(id, viewer);
  }

  @Get(':id/avatar/versions')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'friendAvatarVersions',
    summary: "A friend's past avatars, newest first",
  })
  @ApiOkResponse({ type: AvatarVersionsDto })
  listAvatarVersions(@Param('id') id: string): Promise<AvatarVersionsDto> {
    return this.profiles.listAvatarVersions(id);
  }

  @Post(':id/avatar/versions/:versionId/restore')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'restoreFriendAvatarVersion',
    summary: 'Restore a past avatar as the current one',
  })
  @ApiOkResponse({ type: FriendDto })
  restoreAvatarVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.profiles.restoreAvatarVersion(id, versionId, viewer);
  }

  @Post(':id/connect')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'connectFriend',
    summary: 'Add an existing entry as someone you know',
  })
  @ApiOkResponse({ type: FriendDto })
  connect(
    @Param('id') id: string,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.profiles.connect(id, viewer);
  }

  @Delete(':id/connect')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'disconnectFriend',
    summary: 'Withdraw a pending request, or remove an existing connection',
  })
  @ApiOkResponse({ type: FriendDto })
  disconnect(
    @Param('id') id: string,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.profiles.disconnect(id, viewer);
  }

  @Post(':id/claim')
  @UseGuards(AuthGuard)
  @ApiOperation({
    operationId: 'claimFriend',
    summary: 'Claim an unassociated friend entry as your own account',
  })
  @ApiOkResponse({ type: FriendDto })
  claim(
    @Param('id') id: string,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.profiles.claim(id, viewer);
  }
}
