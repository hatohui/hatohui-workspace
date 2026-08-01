import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CommissionEmailLookupQueryDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;
}

export class CreateClientNoteDto {
  @ApiProperty({ example: 'Looks great, approved!' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
