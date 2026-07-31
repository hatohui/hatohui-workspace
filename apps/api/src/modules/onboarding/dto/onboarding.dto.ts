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
    example: 'images/abc123.jpg',
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
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  birthdayDetailsIds: string[];
}
