import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FriendVisibility } from '@prisma/client';
import {
  ADMIN_PROFILE_SORT_OPTIONS,
  ADMIN_SORT_DIRECTIONS,
  type AdminProfileSortOption,
  type AdminSortDirection,
} from '@/modules/admin/admin.constants';

const VISIBILITIES = Object.values(FriendVisibility);

export class AdminProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  handle!: string | null;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  birthYear!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  birthMonth!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  birthDay!: number | null;

  @ApiProperty({ enum: FriendVisibility, nullable: true })
  visibility!: FriendVisibility | null;

  @ApiProperty({ nullable: true, type: String })
  addedById!: string | null;

  @ApiProperty()
  isAssociated!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class UpdateAdminProfileDto extends PartialType(
  PickType(AdminProfileDto, ['name', 'handle'] as const),
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  override name?: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  override handle?: string | null;

  @ApiProperty({ required: false, nullable: true, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  birthYear?: number | null;

  @ApiProperty({ required: false, type: Number, minimum: 1, maximum: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  birthMonth?: number;

  @ApiProperty({ required: false, type: Number, minimum: 1, maximum: 31 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  birthDay?: number;

  @ApiProperty({ required: false, enum: FriendVisibility })
  @IsOptional()
  @IsIn(VISIBILITIES)
  visibility?: FriendVisibility;
}

export class AdminProfileQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match against name or handle',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    enum: ADMIN_PROFILE_SORT_OPTIONS,
    required: false,
    default: 'name',
  })
  @IsOptional()
  @IsIn(ADMIN_PROFILE_SORT_OPTIONS)
  sort?: AdminProfileSortOption;

  @ApiProperty({ enum: ADMIN_SORT_DIRECTIONS, required: false, default: 'asc' })
  @IsOptional()
  @IsIn(ADMIN_SORT_DIRECTIONS)
  direction?: AdminSortDirection;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class PaginatedAdminProfilesDto {
  @ApiProperty({ type: AdminProfileDto, isArray: true })
  items!: AdminProfileDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  hasMore!: boolean;
}
