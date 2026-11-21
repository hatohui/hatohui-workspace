import { ApiProperty } from '@nestjs/swagger';

export class TravelAccessDto {
  @ApiProperty({
    description:
      'Whether the viewer may edit travel data: an admin, or an email listed in the travel.admin.emails system parameter',
  })
  canEdit!: boolean;
}
