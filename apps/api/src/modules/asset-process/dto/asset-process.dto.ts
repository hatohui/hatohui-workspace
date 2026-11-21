import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  MAX_PROCESS_LABEL_LENGTH,
  MAX_PROCESS_STEPS,
} from '@/modules/asset-process/asset-process.constants';

export class AssetProcessStepDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Storage key; send it back to keep this step' })
  key: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ type: String, nullable: true })
  label: string | null;

  @ApiProperty()
  position: number;
}

export class ProcessStepInputDto {
  @ApiProperty({
    description:
      'Key from POST /images/sign for a new image, or the key of a step this artwork already has',
  })
  @IsString()
  key: string;

  @ApiProperty({ required: false, maxLength: MAX_PROCESS_LABEL_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PROCESS_LABEL_LENGTH)
  label?: string;
}

export class ReplaceAssetProcessDto {
  @ApiProperty({
    type: ProcessStepInputDto,
    isArray: true,
    description: 'The full ordered list; steps left out are deleted',
  })
  @IsArray()
  @ArrayMaxSize(MAX_PROCESS_STEPS)
  @ValidateNested({ each: true })
  @Type(() => ProcessStepInputDto)
  steps: ProcessStepInputDto[];
}
