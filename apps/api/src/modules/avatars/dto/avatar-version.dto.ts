import { ApiProperty } from '@nestjs/swagger';

export class AvatarVersionDto {
  @ApiProperty({ example: 'clx1234567890', description: 'Avatar version id' })
  id: string;

  @ApiProperty({
    example:
      'http://localhost:9000/hatohui-dev/avatars/clx1234567890/abc123.jpg',
    description: 'Public URL of this past avatar',
  })
  url: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class AvatarVersionsDto {
  @ApiProperty({
    type: AvatarVersionDto,
    isArray: true,
    description: 'Past avatars, newest first',
  })
  versions: AvatarVersionDto[];
}
