import { ApiProperty } from '@nestjs/swagger';
import { PreferredContactMethod } from '@prisma/client';

/** Prefill data for a returning client — deliberately thin. No commission
 * history, no internal id; just enough to skip re-typing contact details. */
export class ClientPrefillDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ enum: PreferredContactMethod })
  preferredContactMethod: PreferredContactMethod;

  @ApiProperty({ nullable: true, type: String })
  contactHandle: string | null;
}
