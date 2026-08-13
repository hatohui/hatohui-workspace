import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@prisma/client';

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

export function toPublicUserDto(
  user: Pick<User, 'id' | 'name' | 'handle' | 'avatarUrl'>,
): PublicUserDto {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

/// Use on every User relation load so extra columns cannot leak by accident.
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  handle: true,
  avatarUrl: true,
} as const;
