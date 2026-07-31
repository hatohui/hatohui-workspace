import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { UpcomingFriendDto, FriendDto } from './friend.dto';

export const UPCOMING_GROUP_OPTIONS = ['month', 'age', 'year', 'none'] as const;
export type UpcomingGroupOption = (typeof UPCOMING_GROUP_OPTIONS)[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export class UpcomingSectionsQueryDto {
  @ApiProperty({ required: false, description: 'Match against friend name' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    enum: UPCOMING_GROUP_OPTIONS,
    required: false,
    default: 'month',
  })
  @IsOptional()
  @IsIn(UPCOMING_GROUP_OPTIONS)
  group?: UpcomingGroupOption;

  @ApiProperty({ enum: SORT_DIRECTIONS, required: false, default: 'asc' })
  @IsOptional()
  @IsIn(SORT_DIRECTIONS)
  direction?: SortDirection;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class UpcomingSectionDto {
  @ApiProperty({
    example: '2026-08',
    description:
      "The section's grouping key: YYYY-MM for 'month', the age/year as a string for 'age'/'year', 'unknown' when the underlying field is unset, or 'all' for group 'none'",
  })
  key: string;

  @ApiProperty({ type: UpcomingFriendDto, isArray: true })
  friends: UpcomingFriendDto[];
}

export class PaginatedUpcomingSectionsDto {
  @ApiProperty({ type: UpcomingSectionDto, isArray: true })
  sections: UpcomingSectionDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ description: 'Whether another page can be requested' })
  hasMore: boolean;
}

export class MonthQueryDto {
  @ApiProperty({ example: 8, description: 'Calendar month, 1-12' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ required: false, description: 'Match against friend name' })
  @IsOptional()
  @IsString()
  query?: string;
}

export class BirthdaysByMonthDto {
  @ApiProperty({ type: FriendDto, isArray: true })
  friends: FriendDto[];
}
