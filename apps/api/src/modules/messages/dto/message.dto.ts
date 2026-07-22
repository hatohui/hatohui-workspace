import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: '1', description: 'Unique message id' })
  id: string;

  @ApiProperty({ example: 'Hello from the API!' })
  text: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}
