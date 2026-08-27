import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SubscribeCommissionFollowerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  artistId: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}

export class CommissionFollowerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;
}
