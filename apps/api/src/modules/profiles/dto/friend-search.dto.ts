import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FriendDto } from './friend.dto';

export class FriendSearchQueryDto {
  @ApiProperty({ required: false, description: 'Match against friend name' })
  @IsOptional()
  @IsString()
  query?: string;

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

export class PaginatedFriendsDto {
  @ApiProperty({ type: FriendDto, isArray: true })
  items: FriendDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;
}
