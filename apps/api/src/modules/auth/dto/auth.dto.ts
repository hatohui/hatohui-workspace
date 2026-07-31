import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { OnboardingStatus, Role } from '@prisma/client';

export { Role, OnboardingStatus };

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google OAuth 2.0 authorization code (auth-code popup flow)',
  })
  @IsString()
  @MinLength(1)
  code!: string;
}

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl!: string | null;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty({ enum: OnboardingStatus })
  onboardingStatus!: OnboardingStatus;
}
