import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  SORT_DIRECTIONS,
  UPCOMING_GROUP_OPTIONS,
  type SortDirection,
  type UpcomingGroupOption,
} from '@/modules/birthdays/birthdays.constants';

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
    example:
      'http://localhost:9000/hatohui-dev/avatars/clx1234567890/abc123.jpg',
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
