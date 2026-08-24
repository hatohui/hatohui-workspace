import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CommissionTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    example: 'ICON',
    description: 'Also the i18n key: commission.type.<key>',
  })
  key: string;

  @ApiProperty({ description: 'Display order, ascending' })
  no: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  tagId: string;

  @ApiProperty({
    description: 'Name of the linked Tag, used for gallery filtering',
  })
  tagName: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertCommissionTypeDto {
  @ApiProperty({ example: 'ICON' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  no?: number;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
