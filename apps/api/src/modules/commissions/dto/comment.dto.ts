import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Visibility } from '@prisma/client';

export { Visibility };

export class CommentDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ nullable: true })
  commissionId: string | null;

  @ApiProperty({ nullable: true })
  progressId: string | null;

  @ApiProperty({
    example: 'clx1234567890',
    nullable: true,
    description: 'Set only when authorRole is CLIENT',
  })
  authorClientId: string | null;

  @ApiProperty({
    enum: ['ARTIST', 'CLIENT'],
    description: 'Who wrote the comment',
  })
  authorRole: 'ARTIST' | 'CLIENT';

  @ApiProperty({ enum: Visibility })
  visibility: Visibility;

  @ApiProperty({ example: 'Client confirmed the pose reference.' })
  body: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Client confirmed the pose reference.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    enum: Visibility,
    default: Visibility.INTERNAL,
  })
  @IsEnum(Visibility)
  visibility: Visibility;
}
