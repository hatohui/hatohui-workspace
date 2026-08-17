import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FriendDto } from '@/modules/profiles/dto/friend.dto';

export class MonthQueryDto {
  @ApiProperty({ example: 8, description: 'Calendar month, 1-12' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ required: false, description: 'Match against friend name' })
  @IsOptional()
  @IsString()
  query?: string;
}

export class BirthdaysByMonthDto {
  @ApiProperty({ type: FriendDto, isArray: true })
  friends: FriendDto[];
}
