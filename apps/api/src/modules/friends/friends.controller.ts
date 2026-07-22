import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateFriendDto,
  FriendDto,
  UpcomingFriendDto,
  UpdateFriendDto,
} from './dto/friend.dto';
import { FriendsService } from './friends.service';

@ApiTags('friends')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ operationId: 'friends', summary: 'List all friends' })
  @ApiOkResponse({ type: FriendDto, isArray: true })
  findAll(): Promise<FriendDto[]> {
    return this.friendsService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({
    operationId: 'upcomingFriends',
    summary:
      'List friends sorted by next occurring birthday, with computed age',
  })
  @ApiOkResponse({ type: UpcomingFriendDto, isArray: true })
  findUpcoming(): Promise<UpcomingFriendDto[]> {
    return this.friendsService.findUpcoming();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'friend', summary: 'Get a friend by id' })
  @ApiOkResponse({ type: FriendDto })
  findOne(@Param('id') id: string): Promise<FriendDto> {
    return this.friendsService.findOne(id);
  }

  @Post()
  @ApiOperation({ operationId: 'createFriend', summary: 'Create a friend' })
  @ApiOkResponse({ type: FriendDto })
  create(@Body() dto: CreateFriendDto): Promise<FriendDto> {
    return this.friendsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'updateFriend', summary: 'Update a friend' })
  @ApiOkResponse({ type: FriendDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFriendDto,
  ): Promise<FriendDto> {
    return this.friendsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteFriend', summary: 'Delete a friend' })
  remove(@Param('id') id: string): Promise<void> {
    return this.friendsService.remove(id);
  }
}
