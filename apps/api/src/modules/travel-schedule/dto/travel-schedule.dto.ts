import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TravelWorkScheduleDto {
  @ApiProperty()
  sunday!: boolean;

  @ApiProperty()
  monday!: boolean;

  @ApiProperty()
  tuesday!: boolean;

  @ApiProperty()
  wednesday!: boolean;

  @ApiProperty()
  thursday!: boolean;

  @ApiProperty()
  friday!: boolean;

  @ApiProperty()
  saturday!: boolean;
}

export class UpsertTravelWorkScheduleDto {
  @ApiProperty()
  @IsBoolean()
  sunday!: boolean;

  @ApiProperty()
  @IsBoolean()
  monday!: boolean;

  @ApiProperty()
  @IsBoolean()
  tuesday!: boolean;

  @ApiProperty()
  @IsBoolean()
  wednesday!: boolean;

  @ApiProperty()
  @IsBoolean()
  thursday!: boolean;

  @ApiProperty()
  @IsBoolean()
  friday!: boolean;

  @ApiProperty()
  @IsBoolean()
  saturday!: boolean;
}

export class TravelScheduleExceptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  isWorkDay!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  reason!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class CreateTravelScheduleExceptionDto {
  @ApiProperty({ example: '2026-12-26' })
  @IsDateString()
  date!: string;

  @ApiProperty()
  @IsBoolean()
  isWorkDay!: boolean;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

export class TravelCustomHolidayDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  createdAt!: string;
}

export class CreateTravelCustomHolidayDto {
  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  date!: string;

  @ApiProperty({ minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;
}

export class TravelPublicHolidayDto {
  @ApiProperty({ example: '2026-01-01' })
  date!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ example: 'VN' })
  country!: string;
}

export class TravelCountrySettingDto {
  @ApiProperty({ example: 'VN' })
  country!: string;
}

export class UpdateTravelCountrySettingDto {
  @ApiProperty({ example: 'VN', minLength: 2, maxLength: 2 })
  @IsString()
  @Length(2, 2)
  country!: string;
}

export class TravelHeatmapEntryDto {
  @ApiProperty({ example: '2026-05-01' })
  date!: string;

  @ApiProperty({ example: 1 })
  intensity!: number;
}

export class TravelDateRangeQueryDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  to!: string;
}
