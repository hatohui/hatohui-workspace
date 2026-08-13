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
  handle: string | null;
  avatarUrl: string | null;
  association: {
    birthdayDetails: { name: string; avatarUrl: string | null };
  } | null;
}

/// Name/avatar come from the person's own directory entry when they have
/// one, not straight off the User row — the User row is just the raw Google
/// identity from login and never gets updated afterward, while the entry is
/// what they've actually customized (see AccountView/SidebarAccount, which
/// apply this same preference client-side for the viewer's own identity).
export function toPublicUserDto(user: PublicUserSource): PublicUserDto {
  const entry = user.association?.birthdayDetails;
  return {
    id: user.id,
    name: entry?.name ?? user.name,
    handle: user.handle,
    avatarUrl: entry?.avatarUrl ?? user.avatarUrl,
  };
}

/// Use on every User relation load so extra columns cannot leak by accident.
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  handle: true,
  avatarUrl: true,
  association: {
    select: {
      birthdayDetails: { select: { name: true, avatarUrl: true } },
    },
  },
} as const;
