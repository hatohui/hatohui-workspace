import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PublicUserDto } from '@/modules/users/dto/public-user.dto';

/// How the viewer stands relative to another account. Directional from the
/// viewer's point of view, so the UI can tell "I asked them" from "they asked
/// me" without knowing which column each id sits in.
export const CONNECTION_STATES = [
  'NONE',
  'PENDING_OUTGOING',
  'PENDING_INCOMING',
  'ACCEPTED',
] as const;
export type ConnectionState = (typeof CONNECTION_STATES)[number];

export class CreateConnectionRequestDto {
  @ApiProperty({ description: 'Account to send a connection request to' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class ConnectionDto {
  @ApiProperty({ description: 'Connection row id, used to accept or withdraw' })
  id!: string;

  @ApiProperty({
    type: PublicUserDto,
    description: 'The account on the other side, from the viewer’s perspective',
  })
  user!: PublicUserDto;

  @ApiProperty({ enum: CONNECTION_STATES })
  state!: ConnectionState;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ nullable: true, type: String })
  respondedAt!: string | null;
}

export class ConnectionsDto {
  @ApiProperty({ type: ConnectionDto, isArray: true })
  connections!: ConnectionDto[];
}

export class ConnectionRequestsDto {
  @ApiProperty({
    type: ConnectionDto,
    isArray: true,
    description: 'Requests waiting on the viewer to accept or decline',
  })
  incoming!: ConnectionDto[];

  @ApiProperty({
    type: ConnectionDto,
    isArray: true,
    description: 'Requests the viewer sent that are still unanswered',
  })
  outgoing!: ConnectionDto[];
}
