import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Visibility } from '@prisma/client';

export class CommissionProgressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  commissionId: string;

  @ApiProperty({ nullable: true, type: String })
  projectId: string | null;

  @ApiProperty({ nullable: true, type: String })
  title: string | null;

  @ApiProperty({ nullable: true, type: Object })
  body: object | null;

  @ApiProperty({ type: String, isArray: true })
  images: string[];

  @ApiProperty()
  isFinal: boolean;

  @ApiProperty({ enum: Visibility })
  visibility: Visibility;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class CreateCommissionProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  commissionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  body?: object;

  @ApiProperty({
    type: String,
    isArray: true,
    description: 'Object keys returned by POST /images/sign',
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @ApiProperty({ enum: Visibility, default: Visibility.CLIENT })
  @IsEnum(Visibility)
  visibility: Visibility;

  @ApiProperty({
    required: false,
    description: 'Attach this progress entry (if final) to a Project',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}

export class FinalizeCommissionProgressDto {
  @ApiProperty({
    required: false,
    description: 'Attach the delivered artwork to a Project',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}

export class UpdateCommissionProgressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  body?: object;

  @ApiProperty({
    required: false,
    type: String,
    isArray: true,
    description: 'Object keys returned by POST /images/sign',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false, enum: Visibility })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  projectId?: string | null;
}
