import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { FriendVisibility } from '@prisma/client';
import {
  CONNECTION_STATES,
  type ConnectionState,
} from '@/modules/connections/dto/connection.dto';

export { FriendVisibility };

export class FriendDto {
  @ApiProperty({ example: 'clx1234567890', description: 'Unique friend id' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 1998, nullable: true, description: 'Birth year' })
  birthYear: number | null;

  @ApiProperty({
    example: 5,
    nullable: true,
    description: 'Birth month (1-12)',
  })
  birthMonth: number | null;

  @ApiProperty({ example: 14, nullable: true, description: 'Birth day (1-31)' })
  birthDay: number | null;

  @ApiProperty({
    example: { Twitter: '@jane', Instagram: '@jane.doe' },
    nullable: true,
    type: Object,
  })
  socialMedias: Record<string, string> | null;

  @ApiProperty({ example: true, default: true })
  preferAnonymous: boolean;

  @ApiProperty({ enum: FriendVisibility, example: FriendVisibility.PUBLIC })
  visibility: FriendVisibility;

  @ApiProperty({
    example: 'http://localhost:9000/hatohui-dev/images/abc123.jpg',
    nullable: true,
    description: "Public URL of the friend's avatar image",
  })
  avatarUrl: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Id of the account that added this entry, if any',
  })
  addedById: string | null;

  @ApiProperty({
    example: 'janedoe',
    nullable: true,
    description:
      "The associated account's global @handle, if this entry is linked to one",
  })
  handle: string | null;

  @ApiProperty({
    description: 'Whether this entry is already claimed by an account',
  })
  isAssociated: boolean;

  @ApiProperty({
    description: "Whether this entry is the requesting viewer's own entry",
  })
  isViewerEntry: boolean;

  @ApiProperty({
    enum: CONNECTION_STATES,
    description:
      "How the viewer stands with the account behind this entry. Always NONE for entries nobody has claimed — there's no account to connect with.",
  })
  connectionStatus: ConnectionState;

  @ApiProperty({
    description:
      'Whether the requesting viewer is allowed to edit/delete this entry',
  })
  canEdit: boolean;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  updatedAt: string;
}

export class UpcomingFriendDto {
  @ApiProperty({ example: 'clx1234567890', description: 'Unique friend id' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({
    example: 'janedoe',
    nullable: true,
    description:
      "The associated account's global @handle, if this entry is linked to one",
  })
  handle: string | null;

  @ApiProperty({
    example: 'http://localhost:9000/hatohui-dev/images/abc123.jpg',
    nullable: true,
    description: "Public URL of the friend's avatar image",
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: "Whether this entry is the requesting viewer's own entry",
  })
  isViewerEntry: boolean;

  @ApiProperty({
    example: 28,
    nullable: true,
    description:
      'Age the friend is turning on their next birthday, null if birthYear is unknown',
  })
  turningAge: number | null;

  @ApiProperty({
    example: '2026-08-14',
    description:
      "The friend's next occurring birthday date (year is the anchor year, not necessarily their birth year)",
  })
  nextBirthdayDate: string;
}

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

export class CreateFriendDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1998, required: false })
  @IsOptional()
  @IsInt()
  birthYear?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth?: number;

  @ApiProperty({ example: 14, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  birthDay?: number;

  @ApiProperty({
    example: { Twitter: '@jane', Instagram: '@jane.doe' },
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  socialMedias?: Record<string, string>;

  @ApiProperty({ example: true, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  preferAnonymous?: boolean;

  @ApiProperty({
    enum: FriendVisibility,
    default: FriendVisibility.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(FriendVisibility)
  visibility?: FriendVisibility;

  @ApiProperty({
    example: 'images/abc123.jpg',
    required: false,
    description:
      'Object key returned by POST /images/sign, after uploading the avatar file to storage',
  })
  @IsOptional()
  @IsString()
  avatarKey?: string;
}

export class UpdateFriendDto extends PartialType(CreateFriendDto) {}
