import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';
import { OnboardingStatus } from '@prisma/client';

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

  @ApiProperty({ required: false, enum: OnboardingStatus })
  @IsOptional()
  @IsIn(ONBOARDING_STATUSES)
  onboardingStatus?: OnboardingStatus;
}
