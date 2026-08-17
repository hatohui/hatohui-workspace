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
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { OptionalAuthGuard } from '@/modules/auth/guards/optional-auth.guard';
import { OptionalCurrentUser } from '@/modules/auth/decorators/optional-current-user.decorator';
import {
  CreateFriendDto,
  FriendDto,
  UpdateFriendDto,
} from '@/modules/profiles/dto/friend.dto';
import {
  FriendSearchQueryDto,
  PaginatedFriendsDto,
} from '@/modules/profiles/dto/friend-search.dto';
import { AvatarVersionsDto } from '@/modules/avatars/dto/avatar-version.dto';
import { ProfilesService } from '@/modules/profiles/services/profiles.service';
import type { User } from '@prisma/client';

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'friends', summary: 'List all friends' })
  @ApiOkResponse({ type: FriendDto, isArray: true })
  findAll(@OptionalCurrentUser() viewer: User | null): Promise<FriendDto[]> {
    return this.profiles.findAll(viewer);
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
