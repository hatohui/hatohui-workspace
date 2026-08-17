import { ApiProperty } from '@nestjs/swagger';
import { FriendDto } from '@/modules/profiles/dto/friend.dto';

export class SocialGraphNodeDto {
  @ApiProperty({ type: FriendDto })
  friend: FriendDto;

  @ApiProperty({
    type: FriendDto,
    isArray: true,
    description: 'The next branch out in the social tree view',
  })
  friendsOfFriend: FriendDto[];
}

export class SocialGraphDto {
  @ApiProperty({
    type: SocialGraphNodeDto,
    isArray: true,
    description: "The viewer's connections, for the social tree view",
  })
  friends: SocialGraphNodeDto[];
}
