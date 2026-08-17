import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MAX_BIRTHDAY_LEAD_DAYS,
  MAX_BIRTHDAY_LEAD_DAY_ENTRIES,
  MAX_BIRTHDAY_REMINDER_DAYS_BEFORE,
  MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE,
} from '@/common/utils/birthday-reminders';
import { IsTimezone } from '@/common/validators/timezone.validator';
import { HANDLE_PATTERN } from '@/modules/users/users.constants';
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

  @ApiProperty({
    type: Number,
    isArray: true,
    example: [0, 7],
    required: false,
    description:
      "Days before a connection's birthday to be emailed, where 0 is the day itself. An empty array turns birthday emails off; omitting the field leaves the current preference untouched.",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_BIRTHDAY_LEAD_DAY_ENTRIES)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(MAX_BIRTHDAY_LEAD_DAYS, { each: true })
  birthdayReminderLeadDays?: number[];

  @ApiProperty({
    required: false,
    description:
      'Turns birthday reminder emails on or off without discarding the lead-time settings.',
  })
  @IsOptional()
  @IsBoolean()
  birthdayRemindersEnabled?: boolean;

  @ApiProperty({
    type: Number,
    example: 0,
    minimum: 0,
    maximum: MAX_BIRTHDAY_REMINDER_DAYS_BEFORE,
    required: false,
    description:
      'Days before a birthday for the daily reminder, where 0 is the day itself. Omitting the field leaves it untouched.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_BIRTHDAY_REMINDER_DAYS_BEFORE)
  birthdayReminderDaysBefore?: number;

  @ApiProperty({
    type: Number,
    example: 1,
    minimum: 0,
    maximum: MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE,
    required: false,
    description:
      'Weeks before a birthday for the weekly reminder; 0 turns the weekly reminder off. Omitting the field leaves it untouched.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_BIRTHDAY_REMINDER_WEEKS_BEFORE)
  birthdayReminderWeeksBefore?: number;
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
