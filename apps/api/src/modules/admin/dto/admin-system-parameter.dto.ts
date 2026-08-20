import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { AppScope } from '@prisma/client';

export class AdminSystemParameterDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ enum: AppScope })
  scope!: AppScope;

  @ApiProperty()
  value!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class UpdateAdminSystemParameterDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  value!: string;
}

export class CreateAdminSystemParameterDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  type!: string;

  @ApiProperty({ enum: AppScope })
  @IsEnum(AppScope)
  scope!: AppScope;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  value!: string;
}
