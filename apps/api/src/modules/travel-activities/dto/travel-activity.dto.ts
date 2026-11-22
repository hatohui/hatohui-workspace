import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TravelMediaItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['GROUP', 'ACTIVITY'] })
  source!: 'GROUP' | 'ACTIVITY';

  @ApiProperty()
  key!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  thumbnailUrl!: string;

  @ApiProperty()
  previewUrl!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  caption!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  uploadedById!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  activityId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  activityName!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class TravelActivityPlaceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  mapsUrl!: string | null;
}

export class TravelActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  to!: string;

  @ApiPropertyOptional({ type: TravelActivityPlaceDto, nullable: true })
  place!: TravelActivityPlaceDto | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  mapsUrl!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  latitude!: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  longitude!: number | null;

  @ApiProperty({ type: [String] })
  involvedPeople!: string[];

  @ApiProperty()
  isExcludeMode!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  note!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  imageKey!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  imageUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  thumbnailUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  previewUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  createdById!: string | null;

  @ApiProperty({ type: TravelMediaItemDto, isArray: true })
  media!: TravelMediaItemDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CreateTravelActivityDto {
  @ApiProperty({ minLength: 1, maxLength: 160 })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty()
  @IsDateString()
  from!: string;

  @ApiProperty()
  @IsDateString()
  to!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mapsUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  involvedPeople?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExcludeMode?: boolean;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageKey?: string;
}

export class UpdateTravelActivityDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 160 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  placeId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  mapsUrl?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  involvedPeople?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExcludeMode?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  imageKey?: string | null;
}

export class CreateTravelMediaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  key!: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  caption?: string;
}

export class TravelMediaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  activityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  uploadedById?: string;
}
