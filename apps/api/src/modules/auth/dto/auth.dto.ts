import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { OnboardingStatus } from '@prisma/client';

export { OnboardingStatus };

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google OAuth 2.0 authorization code (auth-code popup flow)',
  })
  @IsString()
  @MinLength(1)
  code!: string;
}

/// The signed-in account's own view of itself. Deliberately carries no email
/// or other contact PII — nothing in this API hands out a person's contact
/// details, not even their own, since the frontend never needs them. Anything
/// describing *another* person uses PublicUserDto instead.
export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    description:
      "The account's display name — its own chosen name if set, otherwise the name from Google login.",
  })
  name!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Global unique handle (e.g. "hatohui"), without the @',
  })
  handle!: string | null;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl!: string | null;

  @ApiProperty({
    description:
      'Whether this account is the configured admin. Cosmetic only — admin routes enforce their own check and also require the admin key.',
  })
  isAdmin!: boolean;

  @ApiProperty({ enum: OnboardingStatus })
  onboardingStatus!: OnboardingStatus;
}
