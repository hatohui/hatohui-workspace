import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { FriendDto, FriendVisibility } from '../../friends/dto/friend.dto';
import { OnboardingStatus } from '../../auth/dto/auth.dto';

export class OnboardingStateDto {
  @ApiProperty({ enum: OnboardingStatus })
  onboardingStatus: OnboardingStatus;

  @ApiProperty({ type: FriendDto, nullable: true })
  entry: FriendDto | null;
}

export class OptInDto {
  @ApiProperty({ description: 'Whether the user wants to join the list' })
  @IsBoolean()
  join: boolean;
}

export class SetProfileDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'uploads/clx1234567890/abc123.jpg',
    required: false,
    description:
      'Object key returned by POST /images/sign, after uploading the avatar file to storage',
  })
  @IsOptional()
  @IsString()
  avatarKey?: string;
}

export class SetVisibilityDto {
  @ApiProperty({ enum: FriendVisibility })
  @IsEnum(FriendVisibility)
  visibility: FriendVisibility;
}

export class SetBirthdayDto {
  @ApiProperty({
    enum: FriendVisibility,
    required: false,
    default: FriendVisibility.PUBLIC,
    description:
      'Who can see this birthday. Sent here rather than applied by the visibility step, which runs before the birthday exists.',
  })
  @IsOptional()
  @IsEnum(FriendVisibility)
  visibility?: FriendVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  birthYear?: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(31)
  birthDay: number;
}

export class AddConnectionsDto {
  @ApiProperty({
    type: [String],
    description:
      'Accounts to send connection requests to. Connections are between accounts, so these are user ids — unclaimed directory entries have nobody to ask.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds: string[];
}
