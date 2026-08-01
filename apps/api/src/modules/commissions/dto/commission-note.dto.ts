import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CommissionNoteVisibility } from '@prisma/client';

export { CommissionNoteVisibility };

export class CommissionNoteDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'clx1234567890' })
  commissionId: string;

  @ApiProperty({
    example: 'clx1234567890',
    nullable: true,
    description: 'Null when submitted by a client via their access link',
  })
  authorId: string | null;

  @ApiProperty({ enum: CommissionNoteVisibility })
  visibility: CommissionNoteVisibility;

  @ApiProperty({ example: 'Client confirmed the pose reference.' })
  body: string;

  @ApiProperty({ example: '2026-07-23T00:00:00.000Z' })
  createdAt: string;
}

export class CreateCommissionNoteDto {
  @ApiProperty({ example: 'Client confirmed the pose reference.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    enum: CommissionNoteVisibility,
    default: CommissionNoteVisibility.INTERNAL,
  })
  @IsEnum(CommissionNoteVisibility)
  visibility: CommissionNoteVisibility;
}
