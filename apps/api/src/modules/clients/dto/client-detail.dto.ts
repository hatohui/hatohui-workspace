import { ApiProperty } from '@nestjs/swagger';
import { CommissionStatus, PreferredContactMethod } from '@prisma/client';

export class ClientAccountDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, type: String })
  handle: string | null;

  @ApiProperty({ nullable: true, type: String })
  avatarUrl: string | null;
}

export class ClientCommissionSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: CommissionStatus })
  status: CommissionStatus;

  @ApiProperty({ nullable: true, type: String })
  commissionTypeKey: string | null;

  @ApiProperty({ nullable: true, type: String })
  commissionTypeLabel: string | null;

  @ApiProperty({ nullable: true, type: Number })
  quote: number | null;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty()
  createdAt: string;
}

export class ClientDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: PreferredContactMethod })
  preferredContactMethod: PreferredContactMethod;

  @ApiProperty({ nullable: true, type: String })
  contactHandle: string | null;

  @ApiProperty({
    type: ClientAccountDto,
    nullable: true,
    description: 'The hatohui account this client is linked to, if any',
  })
  account: ClientAccountDto | null;

  @ApiProperty({
    type: ClientCommissionSummaryDto,
    isArray: true,
    description: 'Every commission this client has had with you, newest first',
  })
  commissions: ClientCommissionSummaryDto[];
}
