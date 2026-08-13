import { ApiProperty } from '@nestjs/swagger';

/// The only user shape any endpoint may hand out about a third party. No
/// email or other internal fields — just enough to render a person and link
/// to them.
export class PublicUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Global unique handle, without the @',
  })
  handle!: string | null;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl!: string | null;
}

export interface PublicUserSource {
  id: string;
  name: string;
  avatarUrl: string | null;
  profile: {
    displayName: string;
    handle: string | null;
    avatarUrl: string | null;
  } | null;
}

/// Everything displayable comes from the profile; the User columns are only a
/// fallback for an account that never finished onboarding.
export function toPublicUserDto(user: PublicUserSource): PublicUserDto {
  return {
    id: user.id,
    name: user.profile?.displayName ?? user.name,
    handle: user.profile?.handle ?? null,
    avatarUrl: user.profile?.avatarUrl ?? user.avatarUrl,
  };
}

/// Use on every User relation load so extra columns cannot leak by accident.
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  profile: {
    select: { displayName: true, handle: true, avatarUrl: true },
  },
} as const;
