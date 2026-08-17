import { ApiProperty } from '@nestjs/swagger';

export class SocialPlatformDto {
  @ApiProperty({ example: 'clx1234567890', description: 'Unique platform id' })
  id: string;

  @ApiProperty({
    example: 'x',
    description: 'Stable identifier for the platform',
  })
  key: string;

  @ApiProperty({ example: 'X (Twitter)' })
  name: string;

  @ApiProperty({
    example: 'https://x.com/',
    description: 'Base URL a handle is appended to',
  })
  baseUrl: string;
}
