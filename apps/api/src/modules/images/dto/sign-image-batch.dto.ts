import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MAX_UPLOADER_NAME_LENGTH } from '@/modules/images/images.constants';
import {
  SignImageDto,
  SignedImageDto,
} from '@/modules/images/dto/sign-image.dto';

export class SignImageBatchItemDto extends PickType(SignImageDto, [
  'fileName',
  'contentType',
  'size',
] as const) {}

export class SignImageBatchDto {
  @ApiProperty({
    type: [SignImageBatchItemDto],
    description: 'Capped by GET /images/upload-limits',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SignImageBatchItemDto)
  files: SignImageBatchItemDto[];

  @ApiProperty({
    required: false,
    example: 'Jane Doe',
    description: 'Required when not signed in; names the upload folder',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_UPLOADER_NAME_LENGTH)
  uploaderName?: string;
}

export class SignedImageBatchDto {
  @ApiProperty({
    type: [SignedImageDto],
    description: 'One signed upload per requested file, in request order',
  })
  items: SignedImageDto[];
}
