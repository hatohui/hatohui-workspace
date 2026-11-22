import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class TravelJobProfileUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  handle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl!: string | null;
}

export class TravelJobProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  title!: string | null;

  @ApiProperty()
  daysOfLeave!: number;

  @ApiProperty()
  daysOfSickLeave!: number;

  @ApiProperty()
  leaveCycleStart!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional({ type: TravelJobProfileUserDto })
  user?: TravelJobProfileUserDto;
}

export class UpsertTravelJobProfileDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiProperty({ minimum: 0, maximum: 365 })
  @IsInt()
  @Min(0)
  @Max(365)
  daysOfLeave!: number;

  @ApiProperty({ minimum: 0, maximum: 365 })
  @IsInt()
  @Min(0)
  @Max(365)
  daysOfSickLeave!: number;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  leaveCycleStart?: string;
}

export class AdminUpsertTravelJobProfileDto extends UpsertTravelJobProfileDto {
  @ApiProperty()
  @IsString()
  userId!: string;
}

export class TravelLeaveBucketDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  used!: number;

  @ApiProperty()
  remaining!: number;
}

export class TravelLeaveBalanceDto {
  @ApiProperty({ type: TravelLeaveBucketDto })
  annual!: TravelLeaveBucketDto;

  @ApiProperty({ type: TravelLeaveBucketDto })
  sick!: TravelLeaveBucketDto;

  @ApiProperty()
  cycleFrom!: string;

  @ApiProperty()
  cycleTo!: string;
}
