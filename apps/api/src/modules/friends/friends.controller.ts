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
  UpcomingFriendDto,
  UpdateFriendDto,
} from './dto/friend.dto';
import {
  FriendSearchQueryDto,
  PaginatedFriendsDto,
} from './dto/friend-search.dto';
import { FriendsService } from './friends.service';
import type { User } from '@prisma/client';

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'friends', summary: 'List all friends' })
  @ApiOkResponse({ type: FriendDto, isArray: true })
  findAll(@OptionalCurrentUser() viewer: User | null): Promise<FriendDto[]> {
    return this.friendsService.findAll(viewer);
  }

  @Get('upcoming')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    operationId: 'upcomingFriends',
    summary:
      'List friends sorted by next occurring birthday, with computed age',
  })
  @ApiOkResponse({ type: UpcomingFriendDto, isArray: true })
  findUpcoming(
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<UpcomingFriendDto[]> {
    return this.friendsService.findUpcoming(viewer);
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
    return this.friendsService.search(
      query.query,
      query.page ?? 1,
      query.pageSize ?? 20,
      viewer,
    );
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ operationId: 'friend', summary: 'Get a friend by id' })
  @ApiOkResponse({ type: FriendDto })
  findOne(
    @Param('id') id: string,
    @OptionalCurrentUser() viewer: User | null,
  ): Promise<FriendDto> {
    return this.friendsService.findOne(id, viewer);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ operationId: 'createFriend', summary: 'Create a friend' })
  @ApiOkResponse({ type: FriendDto })
  create(
    @Body() dto: CreateFriendDto,
    @CurrentUser() viewer: User,
  ): Promise<FriendDto> {
    return this.friendsService.create(dto, viewer);
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
    return this.friendsService.update(id, dto, viewer);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteFriend', summary: 'Delete a friend' })
  remove(@Param('id') id: string, @CurrentUser() viewer: User): Promise<void> {
    return this.friendsService.remove(id, viewer);
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
    return this.friendsService.claim(id, viewer);
  }
}
