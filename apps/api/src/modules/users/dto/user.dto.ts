import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { IsTimezone } from '@/libs/timezone';
import { HANDLE_PATTERN } from '../handle.util';
import { PublicUserDto } from './public-user.dto';

export class UpdateMeDto {
  @ApiProperty({
    example: 'hatohui',
    required: false,
    description:
      'Global unique handle, lowercase letters/digits/underscore, 3-20 chars',
  })
  @IsOptional()
  @IsString()
  @Matches(HANDLE_PATTERN, {
    message: 'handle must be 3-20 lowercase letters, digits, or underscores',
  })
  handle?: string;

  @ApiProperty({
    example: 'Hatohui',
    required: false,
    description:
      'Display name, overriding the name from Google login. Unlike handle, any casing/spacing/accents are fine.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  displayName?: string;

  @ApiProperty({
    example: 'Asia/Ho_Chi_Minh',
    required: false,
    description:
      'IANA timezone name. Birthday reminders about this account are timed against it.',
  })
  @IsOptional()
  @IsTimezone()
  timezone?: string;
}

export class UserSearchQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match against name or @handle',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: PublicUserDto, isArray: true })
  items!: PublicUserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}
