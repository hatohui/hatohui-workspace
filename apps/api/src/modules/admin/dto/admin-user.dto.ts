import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';
import { OnboardingStatus } from '@prisma/client';
import {
  ADMIN_USER_SORT_OPTIONS,
  ADMIN_SORT_DIRECTIONS,
  type AdminUserSortOption,
  type AdminSortDirection,
} from '@/modules/admin/admin.constants';

const ONBOARDING_STATUSES = Object.values(OnboardingStatus);

export class AdminUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl!: string | null;

  @ApiProperty()
  timezone!: string;

  @ApiProperty({ enum: OnboardingStatus })
  onboardingStatus!: OnboardingStatus;

  @ApiProperty()
  isAdmin!: boolean;

  @ApiProperty()
  isArtist!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class UpdateAdminUserDto extends PartialType(
  PickType(AdminUserDto, ['name', 'email', 'avatarUrl', 'timezone'] as const),
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  override name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  override email?: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  override avatarUrl?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  override timezone?: string;

  @ApiProperty({
    required: false,
    description: 'Grant or revoke the admin role',
  })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @ApiProperty({
    required: false,
    description: 'Grant or revoke the artist role',
  })
  @IsOptional()
  @IsBoolean()
  isArtist?: boolean;
}

export class AdminUserQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match against name or email',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false, enum: OnboardingStatus })
  @IsOptional()
  @IsIn(ONBOARDING_STATUSES)
  onboardingStatus?: OnboardingStatus;

  @ApiProperty({
    enum: ADMIN_USER_SORT_OPTIONS,
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(ADMIN_USER_SORT_OPTIONS)
  sort?: AdminUserSortOption;

  @ApiProperty({
    enum: ADMIN_SORT_DIRECTIONS,
    required: false,
    default: 'desc',
  })
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

export class PaginatedAdminUsersDto {
  @ApiProperty({ type: AdminUserDto, isArray: true })
  items!: AdminUserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ description: 'Whether another page can be requested' })
  hasMore!: boolean;
}
