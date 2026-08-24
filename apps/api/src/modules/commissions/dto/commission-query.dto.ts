import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CommissionStatus } from '@prisma/client';
import { CommissionDto } from './commission.dto';
import {
  COMMISSION_SORT_OPTIONS,
  SORT_DIRECTIONS,
  type CommissionSortOption,
  type SortDirection,
} from '@/modules/commissions/commissions.constants';

export class CommissionQueryDto {
  @ApiProperty({
    required: false,
    description: 'Match against client name',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ enum: CommissionStatus, required: false })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @ApiProperty({
    enum: COMMISSION_SORT_OPTIONS,
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(COMMISSION_SORT_OPTIONS)
  sort?: CommissionSortOption;

  @ApiProperty({ enum: SORT_DIRECTIONS, required: false, default: 'desc' })
  @IsOptional()
  @IsIn(SORT_DIRECTIONS)
  direction?: SortDirection;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class PaginatedCommissionsDto {
  @ApiProperty({ type: CommissionDto, isArray: true })
  items: CommissionDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({ description: 'Whether another page can be requested' })
  hasMore: boolean;
}
